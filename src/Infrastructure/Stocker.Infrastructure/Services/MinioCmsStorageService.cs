using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.Configuration;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// MinIO-based implementation of file storage service for CMS media uploads
/// </summary>
public class MinioCmsStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly IMinioClient _publicMinioClient;
    private readonly MinioStorageSettings _settings;
    private readonly ILogger<MinioCmsStorageService> _logger;

    private const string CmsMediaBucket = "cms-media";

    public MinioCmsStorageService(
        IMinioClient minioClient,
        [FromKeyedServices("PublicMinioClient")] IMinioClient publicMinioClient,
        IOptions<MinioStorageSettings> settings,
        ILogger<MinioCmsStorageService> logger)
    {
        _minioClient = minioClient;
        _publicMinioClient = publicMinioClient;
        _settings = settings.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<string> UploadFileAsync(
        Stream stream,
        string path,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Ensure bucket exists
            await EnsureBucketExistsAsync(cancellationToken);

            var size = stream.Length;

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(CmsMediaBucket)
                .WithObject(path)
                .WithStreamData(stream)
                .WithObjectSize(size)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            _logger.LogInformation(
                "Uploaded CMS media file. Path: {Path}, Size: {Size} bytes, ContentType: {ContentType}",
                path, size, contentType);

            // Generate public URL
            var url = await GeneratePublicUrlAsync(path, cancellationToken);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload CMS media file. Path: {Path}", path);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task DeleteFileAsync(string path, CancellationToken cancellationToken = default)
    {
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(CmsMediaBucket)
                .WithObject(path);

            await _minioClient.RemoveObjectAsync(removeObjectArgs, cancellationToken);

            _logger.LogInformation("Deleted CMS media file. Path: {Path}", path);
        }
        catch (Minio.Exceptions.ObjectNotFoundException)
        {
            _logger.LogWarning("Attempted to delete non-existent CMS media file. Path: {Path}", path);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete CMS media file. Path: {Path}", path);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<string> GetSignedUrlAsync(string path, TimeSpan expiresIn)
    {
        try
        {
            var presignedGetObjectArgs = new PresignedGetObjectArgs()
                .WithBucket(CmsMediaBucket)
                .WithObject(path)
                .WithExpiry((int)expiresIn.TotalSeconds);

            var url = await _publicMinioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate signed URL for CMS media. Path: {Path}", path);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(string path, CancellationToken cancellationToken = default)
    {
        try
        {
            var statArgs = new StatObjectArgs()
                .WithBucket(CmsMediaBucket)
                .WithObject(path);

            await _minioClient.StatObjectAsync(statArgs, cancellationToken);
            return true;
        }
        catch (Minio.Exceptions.ObjectNotFoundException)
        {
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check CMS media file existence. Path: {Path}", path);
            throw;
        }
    }

    /// <summary>
    /// Ensures the CMS media bucket exists
    /// </summary>
    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(CmsMediaBucket);
            bool exists = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);

            if (!exists)
            {
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(CmsMediaBucket)
                    .WithLocation(_settings.Region);

                await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);

                _logger.LogInformation("Created CMS media bucket: {Bucket}", CmsMediaBucket);

                // Set bucket policy for public read access (optional, depends on requirements)
                await SetBucketPolicyAsync(cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure CMS media bucket exists");
            throw;
        }
    }

    /// <summary>
    /// Sets bucket policy for public read access
    /// </summary>
    private async Task SetBucketPolicyAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Policy for public read access to all objects in the bucket
            var policy = $$"""
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::{{CmsMediaBucket}}/*"]
                    }
                ]
            }
            """;

            var setPolicyArgs = new SetPolicyArgs()
                .WithBucket(CmsMediaBucket)
                .WithPolicy(policy);

            await _minioClient.SetPolicyAsync(setPolicyArgs, cancellationToken);

            _logger.LogInformation("Set public read policy on CMS media bucket");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to set bucket policy. Files may require signed URLs for access.");
        }
    }

    /// <summary>
    /// Generates a public URL for an object
    /// </summary>
    private async Task<string> GeneratePublicUrlAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            // If bucket has public read policy, construct direct URL
            var protocol = _settings.UseSSL ? "https" : "http";
            var publicEndpoint = _settings.PublicEndpoint ?? _settings.Endpoint;

            // Try to return direct URL if bucket is public
            var directUrl = $"{protocol}://{publicEndpoint}/{CmsMediaBucket}/{path}";

            // Fallback to presigned URL with long expiration
            var expirationHours = _settings.PresignedUrlExpirationHours > 0
                ? _settings.PresignedUrlExpirationHours
                : 168; // 7 days default

            try
            {
                // Verify object exists and return presigned URL as fallback
                var presignedUrl = await GetSignedUrlAsync(path, TimeSpan.FromHours(expirationHours));
                return presignedUrl;
            }
            catch
            {
                return directUrl;
            }
        }
        catch
        {
            return string.Empty;
        }
    }
}
