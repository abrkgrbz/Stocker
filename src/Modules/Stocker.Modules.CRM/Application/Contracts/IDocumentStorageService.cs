using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Contracts;

/// <summary>
/// Service for managing document storage (Azure Blob, AWS S3, Local Storage)
/// </summary>
public interface IDocumentStorageService
{
    /// <summary>
    /// Upload file to storage
    /// </summary>
    Task<Result<DocumentStorageResult>> UploadFileAsync(
        byte[] fileData,
        string fileName,
        string contentType,
        Guid tenantId,
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Download file from storage
    /// </summary>
    Task<Result<byte[]>> DownloadFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete file from storage
    /// </summary>
    Task<Result> DeleteFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get temporary download URL (for direct client access)
    /// </summary>
    /// <param name="inline">If true, browser will display the file inline (view). If false, browser will download the file (attachment).</param>
    Task<Result<string>> GetDownloadUrlAsync(
        string storagePath,
        TimeSpan expiresIn,
        bool inline = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if file exists in storage
    /// </summary>
    Task<Result<bool>> FileExistsAsync(
        string storagePath,
        CancellationToken cancellationToken = default);
}

public record DocumentStorageResult(
    string StoragePath,
    string Provider,
    string Url);
