using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Infrastructure.Configuration;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// MinIO-based implementation of product image storage service
/// </summary>
public class MinioProductImageStorageService : IProductImageStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _settings;
    private readonly ILogger<MinioProductImageStorageService> _logger;

    public MinioProductImageStorageService(
        IMinioClient minioClient,
        IOptions<MinioSettings> settings,
        ILogger<MinioProductImageStorageService> logger)
    {
        _minioClient = minioClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<Result<ImageStorageResult>> UploadImageAsync(
        byte[] imageData,
        string fileName,
        string contentType,
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Ensure bucket exists
            await EnsureBucketExistsAsync(cancellationToken);

            // Organize folder structure: tenant/module/products/productId/year/month/timestamp_guid_filename
            var now = DateTimeOffset.UtcNow;
            var folderPath = $"{tenantId}/inventory/products/{productId}/{now:yyyy}/{now:MM}";
            var uniqueFileName = $"{now:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}_{SanitizeFileName(fileName)}";
            var objectName = $"{folderPath}/{uniqueFileName}";

            // Upload file to MinIO
            using var stream = new MemoryStream(imageData);
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(imageData.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            _logger.LogInformation(
                "Product image uploaded to MinIO. Tenant: {TenantId}, Product: {ProductId}, Path: {ObjectPath}, Size: {Size} bytes",
                tenantId, productId, objectName, imageData.Length);

            // Generate public URL
            string url;
            var publicEndpoint = _settings.PublicEndpoint ?? _settings.Endpoint;
            if (publicEndpoint.StartsWith("http://") || publicEndpoint.StartsWith("https://"))
            {
                // PublicEndpoint already includes protocol
                url = $"{publicEndpoint}/{_settings.BucketName}/{objectName}";
            }
            else
            {
                // Add protocol based on UseSSL setting
                url = $"{(_settings.UseSSL ? "https" : "http")}://{publicEndpoint}/{_settings.BucketName}/{objectName}";
            }

            return Result<ImageStorageResult>.Success(new ImageStorageResult(
                StoragePath: objectName,
                Url: url,
                FileSize: imageData.Length));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload product image to MinIO. FileName: {FileName}", fileName);
            return Result<ImageStorageResult>.Failure(
                Error.Failure("Storage.Upload", $"Failed to upload image: {ex.Message}"));
        }
    }

    public async Task<Result<ImageStorageResult>> UploadImageWithThumbnailAsync(
        byte[] imageData,
        string fileName,
        string contentType,
        Guid tenantId,
        int productId,
        int thumbnailWidth = 200,
        int thumbnailHeight = 200,
        CancellationToken cancellationToken = default)
    {
        // First upload the original image
        var originalResult = await UploadImageAsync(imageData, fileName, contentType, tenantId, productId, cancellationToken);
        if (!originalResult.IsSuccess)
        {
            return originalResult;
        }

        // For now, we'll just return the original without thumbnail
        // Thumbnail generation can be added later with ImageSharp or SkiaSharp
        // This keeps the initial implementation simple

        _logger.LogInformation(
            "Product image uploaded (thumbnail generation not implemented yet). Path: {Path}",
            originalResult.Value.StoragePath);

        return originalResult;
    }

    public async Task<Result> DeleteImageAsync(
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
                "Product image deleted from MinIO. Bucket: {Bucket}, Object: {Object}",
                _settings.BucketName, storagePath);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete image from MinIO. StoragePath: {StoragePath}", storagePath);
            return Result.Failure(
                Error.Failure("Storage.Delete", $"Failed to delete image: {ex.Message}"));
        }
    }

    public async Task<Result<string>> GetImageUrlAsync(
        string storagePath,
        TimeSpan expiresIn,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var presignedGetObjectArgs = new PresignedGetObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(storagePath)
                .WithExpiry((int)expiresIn.TotalSeconds);

            string url;

            // Use public endpoint for presigned URLs if configured
            if (!string.IsNullOrEmpty(_settings.PublicEndpoint) &&
                !string.Equals(_settings.Endpoint, _settings.PublicEndpoint, StringComparison.OrdinalIgnoreCase))
            {
                var publicEndpoint = _settings.PublicEndpoint.Replace("https://", "").Replace("http://", "");
                var useSSL = _settings.PublicEndpoint.StartsWith("https://");

                var publicMinioClient = new MinioClient()
                    .WithEndpoint(publicEndpoint)
                    .WithCredentials(_settings.AccessKey, _settings.SecretKey)
                    .WithSSL(useSSL)
                    .Build();

                url = await publicMinioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
            }
            else
            {
                url = await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
            }

            _logger.LogDebug(
                "Presigned URL generated for product image. Object: {Object}, Expires: {Expires}",
                storagePath, expiresIn);

            return Result<string>.Success(url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned URL. StoragePath: {StoragePath}", storagePath);
            return Result<string>.Failure(
                Error.Failure("Storage.PresignedUrl", $"Failed to generate URL: {ex.Message}"));
        }
    }

    public async Task<Result<bool>> ImageExistsAsync(
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
            if (ex.Message.Contains("Not found", StringComparison.OrdinalIgnoreCase))
            {
                return Result<bool>.Success(false);
            }

            _logger.LogError(ex, "Failed to check image existence. StoragePath: {StoragePath}", storagePath);
            return Result<bool>.Failure(
                Error.Failure("Storage.FileExists", $"Failed to check existence: {ex.Message}"));
        }
    }

    /// <summary>
    /// Ensures the configured bucket exists
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

                _logger.LogInformation("MinIO bucket created for product images: {Bucket}", _settings.BucketName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure bucket exists: {Bucket}", _settings.BucketName);
            throw;
        }
    }

    /// <summary>
    /// Sanitize filename for safe storage
    /// </summary>
    private static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return sanitized.Replace(" ", "_").ToLowerInvariant();
    }
}
