using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.Modules.CRM.Infrastructure.Configuration;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Infrastructure.Services;

/// <summary>
/// MinIO-based implementation of document storage service
/// </summary>
public class MinioDocumentStorageService : IDocumentStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _settings;
    private readonly ILogger<MinioDocumentStorageService> _logger;

    public MinioDocumentStorageService(
        IMinioClient minioClient,
        IOptions<MinioSettings> settings,
        ILogger<MinioDocumentStorageService> logger)
    {
        _minioClient = minioClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<Result<DocumentStorageResult>> UploadFileAsync(
        byte[] fileData,
        string fileName,
        string contentType,
        Guid tenantId,
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Ensure bucket exists
            await EnsureBucketExistsAsync(cancellationToken);

            // Organize folder structure: tenant/entityType/entityId/year/month/timestamp_guid_filename
            var now = DateTimeOffset.UtcNow;
            var folderPath = $"{tenantId}/{entityType.ToLowerInvariant()}/{entityId}/{now:yyyy}/{now:MM}";
            var uniqueFileName = $"{now:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}_{fileName}";
            var objectName = $"{folderPath}/{uniqueFileName}";

            // Upload file to MinIO
            using var stream = new MemoryStream(fileData);
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(fileData.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            _logger.LogInformation(
                "File uploaded successfully to MinIO. Tenant: {TenantId}, Entity: {EntityType}/{EntityId}, Path: {ObjectPath}, Size: {Size} bytes",
                tenantId, entityType, entityId, objectName, fileData.Length);

            // Generate public URL (or use presigned URL for temporary access)
            var url = $"{(_settings.UseSSL ? "https" : "http")}://{_settings.Endpoint}/{_settings.BucketName}/{objectName}";

            return Result<DocumentStorageResult>.Success(new DocumentStorageResult(
                StoragePath: objectName,
                Provider: "MinIO",
                Url: url));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file to MinIO. FileName: {FileName}", fileName);
            return Result<DocumentStorageResult>.Failure(
                Error.Failure("Storage.Upload", $"Failed to upload file: {ex.Message}"));
        }
    }

    public async Task<Result<byte[]>> DownloadFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var memoryStream = new MemoryStream();

            var getObjectArgs = new GetObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(storagePath)
                .WithCallbackStream(stream => stream.CopyTo(memoryStream));

            await _minioClient.GetObjectAsync(getObjectArgs, cancellationToken);

            _logger.LogInformation(
                "File downloaded successfully from MinIO. Bucket: {Bucket}, Object: {Object}",
                _settings.BucketName, storagePath);

            return Result<byte[]>.Success(memoryStream.ToArray());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download file from MinIO. StoragePath: {StoragePath}", storagePath);
            return Result<byte[]>.Failure(
                Error.Failure("Storage.Download", $"Failed to download file: {ex.Message}"));
        }
    }

    public async Task<Result> DeleteFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(storagePath);

            await _minioClient.RemoveObjectAsync(removeObjectArgs, cancellationToken);

            _logger.LogInformation(
                "File deleted successfully from MinIO. Bucket: {Bucket}, Object: {Object}",
                _settings.BucketName, storagePath);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file from MinIO. StoragePath: {StoragePath}", storagePath);
            return Result.Failure(
                Error.Failure("Storage.Delete", $"Failed to delete file: {ex.Message}"));
        }
    }

    public async Task<Result<string>> GetDownloadUrlAsync(
        string storagePath,
        TimeSpan expiresIn,
        bool inline = false,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Extract original filename from storage path for Content-Disposition header
            var fileName = Path.GetFileName(storagePath);

            // Extract the original filename (after the timestamp_guid_ prefix)
            var fileNameParts = fileName.Split('_');
            if (fileNameParts.Length >= 3)
            {
                // Format: yyyyMMdd_HHmmss_guid_originalfilename
                fileName = string.Join("_", fileNameParts.Skip(2));
            }

            // Set Content-Disposition: inline for viewing in browser, attachment for downloading
            var disposition = inline ? "inline" : "attachment";

            var presignedGetObjectArgs = new PresignedGetObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(storagePath)
                .WithExpiry((int)expiresIn.TotalSeconds)
                .WithHeaders(new Dictionary<string, string>
                {
                    ["response-content-disposition"] = $"{disposition}; filename=\"{fileName}\""
                });

            string url;

            // Use public endpoint client for presigned URLs if configured
            if (!string.IsNullOrEmpty(_settings.PublicEndpoint) &&
                !string.Equals(_settings.Endpoint, _settings.PublicEndpoint, StringComparison.OrdinalIgnoreCase))
            {
                // Create a separate MinIO client with public endpoint for presigned URLs
                // This ensures the signature is calculated for the correct hostname
                var publicEndpoint = _settings.PublicEndpoint.Replace("https://", "").Replace("http://", "");
                var useSSL = _settings.PublicEndpoint.StartsWith("https://");

                var publicMinioClient = new MinioClient()
                    .WithEndpoint(publicEndpoint)
                    .WithCredentials(_settings.AccessKey, _settings.SecretKey)
                    .WithSSL(useSSL)
                    .Build();

                url = await publicMinioClient.PresignedGetObjectAsync(presignedGetObjectArgs);

                _logger.LogInformation(
                    "Generated presigned URL with public endpoint. Endpoint: {Endpoint}, SSL: {SSL}",
                    publicEndpoint, useSSL);
            }
            else
            {
                // Use the default internal client
                url = await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
            }

            _logger.LogInformation(
                "Presigned URL generated for MinIO object. Bucket: {Bucket}, Object: {Object}, Expires: {Expires}",
                _settings.BucketName, storagePath, expiresIn);

            return Result<string>.Success(url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned URL. StoragePath: {StoragePath}", storagePath);
            return Result<string>.Failure(
                Error.Failure("Storage.PresignedUrl", $"Failed to generate download URL: {ex.Message}"));
        }
    }

    public async Task<Result<bool>> FileExistsAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(storagePath);

            await _minioClient.StatObjectAsync(statObjectArgs, cancellationToken);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            // File not found is not an error - it just doesn't exist
            if (ex.Message.Contains("Not found", StringComparison.OrdinalIgnoreCase))
            {
                return Result<bool>.Success(false);
            }

            _logger.LogError(ex, "Failed to check file existence in MinIO. StoragePath: {StoragePath}", storagePath);
            return Result<bool>.Failure(
                Error.Failure("Storage.FileExists", $"Failed to check file existence: {ex.Message}"));
        }
    }

    /// <summary>
    /// Ensures the configured bucket exists, creates it if it doesn't
    /// </summary>
    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var bucketExistsArgs = new BucketExistsArgs()
                .WithBucket(_settings.BucketName);

            bool found = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);

            if (!found)
            {
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(_settings.BucketName);

                await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);

                _logger.LogInformation("MinIO bucket created: {Bucket}", _settings.BucketName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure bucket exists: {Bucket}", _settings.BucketName);
            throw;
        }
    }
}
