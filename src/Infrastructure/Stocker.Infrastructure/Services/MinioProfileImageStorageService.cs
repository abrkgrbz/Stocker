using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.Configuration;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// MinIO-based implementation for profile image storage
/// Stores images in tenant-specific buckets with proper folder structure
/// </summary>
public class MinioProfileImageStorageService : IProfileImageStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioStorageSettings _settings;
    private readonly ITenantStorageService _tenantStorageService;
    private readonly ILogger<MinioProfileImageStorageService> _logger;

    private const string ProfileImagesFolder = "profile-images";
    private const string MasterBucket = "master-storage";

    public MinioProfileImageStorageService(
        IMinioClient minioClient,
        IOptions<MinioStorageSettings> settings,
        ITenantStorageService tenantStorageService,
        ILogger<MinioProfileImageStorageService> logger)
    {
        _minioClient = minioClient;
        _settings = settings.Value;
        _tenantStorageService = tenantStorageService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<string>> UploadProfileImageAsync(
        Guid? tenantId,
        Guid userId,
        Stream imageStream,
        string contentType,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var bucketName = GetBucketName(tenantId);
            var objectName = GetObjectName(userId, fileName);

            // Ensure bucket exists
            await EnsureBucketExistsAsync(bucketName, tenantId, cancellationToken);

            // Delete existing profile image if any
            await DeleteExistingProfileImagesAsync(bucketName, userId, cancellationToken);

            // Upload new image
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(imageStream)
                .WithObjectSize(imageStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            _logger.LogInformation(
                "Profile image uploaded. TenantId: {TenantId}, UserId: {UserId}, Object: {Object}",
                tenantId, userId, objectName);

            // Return the object path (will be used to generate presigned URL when needed)
            var imageUrl = await GeneratePresignedUrlAsync(bucketName, objectName, 168, cancellationToken); // 7 days

            return Result<string>.Success(imageUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to upload profile image. TenantId: {TenantId}, UserId: {UserId}",
                tenantId, userId);

            return Result<string>.Failure(
                Error.Failure("ProfileImage.Upload", $"Failed to upload profile image: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> DeleteProfileImageAsync(
        Guid? tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var bucketName = GetBucketName(tenantId);

            await DeleteExistingProfileImagesAsync(bucketName, userId, cancellationToken);

            _logger.LogInformation(
                "Profile image deleted. TenantId: {TenantId}, UserId: {UserId}",
                tenantId, userId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to delete profile image. TenantId: {TenantId}, UserId: {UserId}",
                tenantId, userId);

            return Result.Failure(
                Error.Failure("ProfileImage.Delete", $"Failed to delete profile image: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<string>> GetProfileImageUrlAsync(
        Guid? tenantId,
        Guid userId,
        int expiryInHours = 24,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var bucketName = GetBucketName(tenantId);
            var prefix = $"{ProfileImagesFolder}/{userId}";

            // Find the user's profile image
            var listObjectsArgs = new ListObjectsArgs()
                .WithBucket(bucketName)
                .WithPrefix(prefix);

            string? objectName = null;
            await foreach (var item in _minioClient.ListObjectsEnumAsync(listObjectsArgs, cancellationToken))
            {
                objectName = item.Key;
                break; // Take first match
            }

            if (string.IsNullOrEmpty(objectName))
            {
                return Result<string>.Failure(
                    Error.NotFound("ProfileImage.NotFound", "Profile image not found"));
            }

            var url = await GeneratePresignedUrlAsync(bucketName, objectName, expiryInHours, cancellationToken);

            return Result<string>.Success(url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to get profile image URL. TenantId: {TenantId}, UserId: {UserId}",
                tenantId, userId);

            return Result<string>.Failure(
                Error.Failure("ProfileImage.GetUrl", $"Failed to get profile image URL: {ex.Message}"));
        }
    }

    private string GetBucketName(Guid? tenantId)
    {
        if (tenantId.HasValue)
        {
            return _tenantStorageService.GetTenantBucketName(tenantId.Value);
        }

        return MasterBucket;
    }

    private static string GetObjectName(Guid userId, string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var timestamp = DateTime.UtcNow.Ticks;
        return $"{ProfileImagesFolder}/{userId}/{timestamp}{extension}";
    }

    private async Task EnsureBucketExistsAsync(
        string bucketName,
        Guid? tenantId,
        CancellationToken cancellationToken)
    {
        var bucketExistsArgs = new BucketExistsArgs().WithBucket(bucketName);
        bool exists = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);

        if (!exists)
        {
            if (tenantId.HasValue)
            {
                // Create tenant bucket through the tenant storage service
                await _tenantStorageService.CreateTenantBucketAsync(tenantId.Value, 10, cancellationToken);
            }
            else
            {
                // Create master bucket
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(bucketName)
                    .WithLocation(_settings.Region);

                await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);

                _logger.LogInformation("Master storage bucket created: {Bucket}", bucketName);
            }
        }
    }

    private async Task DeleteExistingProfileImagesAsync(
        string bucketName,
        Guid userId,
        CancellationToken cancellationToken)
    {
        try
        {
            var prefix = $"{ProfileImagesFolder}/{userId}/";

            var listObjectsArgs = new ListObjectsArgs()
                .WithBucket(bucketName)
                .WithPrefix(prefix)
                .WithRecursive(true);

            var objectsToDelete = new List<string>();
            await foreach (var item in _minioClient.ListObjectsEnumAsync(listObjectsArgs, cancellationToken))
            {
                objectsToDelete.Add(item.Key);
            }

            if (objectsToDelete.Count > 0)
            {
                var removeObjectsArgs = new RemoveObjectsArgs()
                    .WithBucket(bucketName)
                    .WithObjects(objectsToDelete);

                await _minioClient.RemoveObjectsAsync(removeObjectsArgs, cancellationToken);

                _logger.LogDebug(
                    "Deleted {Count} existing profile images for user {UserId}",
                    objectsToDelete.Count, userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to delete existing profile images. Bucket: {Bucket}, UserId: {UserId}",
                bucketName, userId);
            // Don't throw - we'll just upload the new image
        }
    }

    private async Task<string> GeneratePresignedUrlAsync(
        string bucketName,
        string objectName,
        int expiryInHours,
        CancellationToken cancellationToken)
    {
        var presignedGetObjectArgs = new PresignedGetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithExpiry(expiryInHours * 3600); // Convert hours to seconds

        return await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
    }
}
