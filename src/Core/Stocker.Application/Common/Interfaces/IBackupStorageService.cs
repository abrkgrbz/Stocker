using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing backup file storage in MinIO
/// Stores backup files in tenant's bucket under 'backups/' folder
/// </summary>
public interface IBackupStorageService
{
    /// <summary>
    /// Uploads a backup file to tenant's storage
    /// Path format: {tenant-bucket}/backups/{backupId}/{filename}
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="fileName">The backup file name</param>
    /// <param name="fileStream">The file content stream</param>
    /// <param name="contentType">MIME type of the file</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the storage path if successful</returns>
    Task<Result<BackupUploadResult>> UploadBackupFileAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        Stream fileStream,
        string contentType = "application/octet-stream",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a backup file from tenant's storage
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="fileName">The backup file name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the file stream if successful</returns>
    Task<Result<Stream>> DownloadBackupFileAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a presigned URL for downloading a backup file
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="fileName">The backup file name</param>
    /// <param name="expiryMinutes">URL expiry time in minutes (default: 60)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the presigned URL if successful</returns>
    Task<Result<string>> GetDownloadUrlAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        int expiryMinutes = 60,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a backup file from tenant's storage
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="fileName">The backup file name (optional, if null deletes all files for backup)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> DeleteBackupFileAsync(
        Guid tenantId,
        Guid backupId,
        string? fileName = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes all files associated with a backup
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result indicating success or failure</returns>
    Task<Result> DeleteBackupAsync(
        Guid tenantId,
        Guid backupId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes all backup files for a tenant that are older than the specified date
    /// Used for retention policy enforcement
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="olderThan">Delete files older than this date</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the count of deleted files</returns>
    Task<Result<int>> DeleteOldBackupsAsync(
        Guid tenantId,
        DateTime olderThan,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Lists all backup files for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">Optional: filter by specific backup ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing list of backup file info</returns>
    Task<Result<IEnumerable<BackupFileInfo>>> ListBackupFilesAsync(
        Guid tenantId,
        Guid? backupId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total size of all backup files for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the total size in bytes</returns>
    Task<Result<long>> GetTotalBackupSizeAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a backup file exists
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="fileName">The backup file name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing true if file exists</returns>
    Task<Result<bool>> BackupFileExistsAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the storage path for a backup file
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="fileName">The backup file name</param>
    /// <returns>The full storage path</returns>
    string GetBackupPath(Guid tenantId, Guid backupId, string fileName);
}

/// <summary>
/// Result of a backup file upload operation
/// </summary>
public record BackupUploadResult(
    string StoragePath,
    string StorageLocation,
    long SizeInBytes,
    string? DownloadUrl = null);

/// <summary>
/// Information about a backup file in storage
/// </summary>
public record BackupFileInfo(
    string FileName,
    string FullPath,
    long SizeInBytes,
    DateTime LastModified,
    Guid? BackupId);
