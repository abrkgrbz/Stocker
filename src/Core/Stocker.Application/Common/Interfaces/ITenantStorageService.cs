using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing tenant-specific storage buckets and quotas in MinIO
/// </summary>
public interface ITenantStorageService
{
    /// <summary>
    /// Creates a dedicated storage bucket for a tenant with the specified quota
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="quotaGB">Storage quota in gigabytes</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the bucket name if successful</returns>
    Task<Result<string>> CreateTenantBucketAsync(
        Guid tenantId,
        long quotaGB,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the storage quota for an existing tenant bucket
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="newQuotaGB">New storage quota in gigabytes</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> UpdateTenantQuotaAsync(
        Guid tenantId,
        long newQuotaGB,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current storage usage for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing storage usage information</returns>
    Task<Result<TenantStorageUsage>> GetTenantStorageUsageAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a tenant's bucket exists
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result<bool>> TenantBucketExistsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a tenant's storage bucket and all its contents
    /// WARNING: This operation is irreversible
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> DeleteTenantBucketAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the bucket name for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <returns>The bucket name</returns>
    string GetTenantBucketName(Guid tenantId);

    /// <summary>
    /// Lists all tenant buckets in MinIO (Admin only)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing list of all bucket information</returns>
    Task<Result<IEnumerable<BucketInfo>>> ListAllBucketsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a bucket by name (Admin only)
    /// WARNING: This operation is irreversible
    /// </summary>
    /// <param name="bucketName">The bucket name to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> DeleteBucketByNameAsync(
        string bucketName,
        CancellationToken cancellationToken = default);

    // ==================== FILE BROWSER OPERATIONS ====================

    /// <summary>
    /// Lists objects (files and folders) in a bucket with optional prefix filtering
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="prefix">Optional prefix to filter objects (folder path)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing list of storage objects</returns>
    Task<Result<IEnumerable<StorageObjectInfo>>> ListObjectsAsync(
        string bucketName,
        string? prefix = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads a file to a bucket
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="objectName">The object name (path in bucket)</param>
    /// <param name="data">File data stream</param>
    /// <param name="contentType">Content type of the file</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the upload result</returns>
    Task<Result<UploadResult>> UploadObjectAsync(
        string bucketName,
        string objectName,
        Stream data,
        string contentType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a file from a bucket
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="objectName">The object name (path in bucket)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the file stream and metadata</returns>
    Task<Result<DownloadResult>> DownloadObjectAsync(
        string bucketName,
        string objectName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an object from a bucket
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="objectName">The object name (path in bucket)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> DeleteObjectAsync(
        string bucketName,
        string objectName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes multiple objects from a bucket
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="objectNames">List of object names to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result<int>> DeleteObjectsAsync(
        string bucketName,
        IEnumerable<string> objectNames,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a presigned URL for downloading an object
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="objectName">The object name (path in bucket)</param>
    /// <param name="expiresIn">URL expiration time</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the presigned URL</returns>
    Task<Result<string>> GetPresignedUrlAsync(
        string bucketName,
        string objectName,
        TimeSpan expiresIn,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a folder (empty object with trailing slash)
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="folderPath">The folder path (without trailing slash)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> CreateFolderAsync(
        string bucketName,
        string folderPath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an object exists in a bucket
    /// </summary>
    /// <param name="bucketName">The bucket name</param>
    /// <param name="objectName">The object name (path in bucket)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result<bool>> ObjectExistsAsync(
        string bucketName,
        string objectName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new bucket
    /// </summary>
    /// <param name="bucketName">The bucket name to create</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> CreateBucketAsync(
        string bucketName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the URL for a system asset (logo, favicon, email-banner)
    /// </summary>
    /// <param name="assetName">The asset name (e.g., "logo", "favicon", "email-banner")</param>
    /// <param name="expiresIn">URL expiration time (default 7 days)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the presigned URL or null if asset doesn't exist</returns>
    Task<Result<string?>> GetSystemAssetUrlAsync(
        string assetName,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Storage usage information for a tenant
/// </summary>
public record TenantStorageUsage(
    string BucketName,
    long QuotaBytes,
    long UsedBytes,
    long AvailableBytes,
    double UsagePercentage,
    int ObjectCount);

/// <summary>
/// Bucket information for admin listing
/// </summary>
public record BucketInfo(
    string Name,
    DateTime CreationDate,
    long UsedBytes,
    int ObjectCount,
    Guid? TenantId);

/// <summary>
/// Storage object information (file or folder)
/// </summary>
public record StorageObjectInfo(
    string Name,
    string Key,
    long Size,
    DateTime LastModified,
    string ContentType,
    bool IsFolder,
    string? ETag = null);

/// <summary>
/// Upload operation result
/// </summary>
public record UploadResult(
    string BucketName,
    string ObjectName,
    string ETag,
    long Size,
    string Url);

/// <summary>
/// Download operation result
/// </summary>
public record DownloadResult(
    Stream Data,
    string ContentType,
    long Size,
    string FileName);
