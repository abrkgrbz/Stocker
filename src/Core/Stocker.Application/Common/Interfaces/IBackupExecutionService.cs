using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for executing backup operations
/// Handles the actual backup creation process including database and file exports
/// </summary>
public interface IBackupExecutionService
{
    /// <summary>
    /// Executes a full backup operation for a tenant
    /// Creates database dump and/or file archive based on options
    /// </summary>
    /// <param name="request">Backup execution request with options</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing backup execution result</returns>
    Task<Result<BackupExecutionResult>> ExecuteBackupAsync(
        BackupExecutionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes a restore operation from a backup
    /// </summary>
    /// <param name="request">Restore execution request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result indicating success or failure</returns>
    Task<Result> ExecuteRestoreAsync(
        RestoreExecutionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates a backup file to ensure it can be restored
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="backupId">The backup's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing validation information</returns>
    Task<Result<BackupValidationResult>> ValidateBackupAsync(
        Guid tenantId,
        Guid backupId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Request for executing a backup
/// </summary>
public record BackupExecutionRequest(
    Guid TenantId,
    Guid BackupId,
    string BackupName,
    string BackupType,
    bool IncludeDatabase,
    bool IncludeFiles,
    bool IncludeConfiguration,
    bool Compress,
    bool Encrypt,
    string? Description = null);

/// <summary>
/// Result of a backup execution
/// </summary>
public record BackupExecutionResult(
    string FilePath,
    string StorageLocation,
    long SizeInBytes,
    string? DownloadUrl,
    TimeSpan Duration,
    BackupManifest Manifest);

/// <summary>
/// Manifest of what's included in a backup
/// </summary>
public record BackupManifest(
    string BackupId,
    string TenantId,
    DateTime CreatedAt,
    string BackupType,
    bool IncludesDatabase,
    bool IncludesFiles,
    bool IncludesConfiguration,
    bool IsCompressed,
    bool IsEncrypted,
    DatabaseManifest? Database,
    FilesManifest? Files,
    ConfigurationManifest? Configuration);

/// <summary>
/// Database backup manifest
/// </summary>
public record DatabaseManifest(
    int TableCount,
    long TotalRows,
    long SizeBytes,
    IReadOnlyList<string> Tables);

/// <summary>
/// Files backup manifest
/// </summary>
public record FilesManifest(
    int FileCount,
    int FolderCount,
    long TotalSizeBytes);

/// <summary>
/// Configuration backup manifest
/// </summary>
public record ConfigurationManifest(
    int SettingsCount,
    IReadOnlyList<string> Categories);

/// <summary>
/// Request for executing a restore operation
/// </summary>
public record RestoreExecutionRequest(
    Guid TenantId,
    Guid BackupId,
    bool RestoreDatabase,
    bool RestoreFiles,
    bool RestoreConfiguration,
    string? Notes = null);

/// <summary>
/// Result of backup validation
/// </summary>
public record BackupValidationResult(
    bool IsValid,
    bool IsRestorable,
    string? ErrorMessage,
    BackupManifest? Manifest);
