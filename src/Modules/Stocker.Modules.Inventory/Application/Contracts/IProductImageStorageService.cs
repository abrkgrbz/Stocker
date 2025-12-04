using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Contracts;

/// <summary>
/// Service for managing product image storage (MinIO/S3 compatible)
/// </summary>
public interface IProductImageStorageService
{
    /// <summary>
    /// Upload product image to storage
    /// </summary>
    Task<Result<ImageStorageResult>> UploadImageAsync(
        byte[] imageData,
        string fileName,
        string contentType,
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Upload product image with thumbnail generation
    /// </summary>
    Task<Result<ImageStorageResult>> UploadImageWithThumbnailAsync(
        byte[] imageData,
        string fileName,
        string contentType,
        Guid tenantId,
        int productId,
        int thumbnailWidth = 200,
        int thumbnailHeight = 200,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete image from storage
    /// </summary>
    Task<Result> DeleteImageAsync(
        string storagePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get temporary download/view URL for image
    /// </summary>
    Task<Result<string>> GetImageUrlAsync(
        string storagePath,
        TimeSpan expiresIn,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if image exists in storage
    /// </summary>
    Task<Result<bool>> ImageExistsAsync(
        string storagePath,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of image upload operation
/// </summary>
public record ImageStorageResult(
    string StoragePath,
    string Url,
    string? ThumbnailStoragePath = null,
    string? ThumbnailUrl = null,
    long? FileSize = null,
    int? Width = null,
    int? Height = null);
