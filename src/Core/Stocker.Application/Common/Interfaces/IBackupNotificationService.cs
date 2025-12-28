using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for sending backup-related notifications via email and real-time (SignalR)
/// </summary>
public interface IBackupNotificationService
{
    /// <summary>
    /// Sends notification when a backup starts
    /// </summary>
    Task<Result> NotifyBackupStartedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string backupType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a backup completes successfully
    /// </summary>
    Task<Result> NotifyBackupCompletedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string backupType,
        long sizeInBytes,
        TimeSpan duration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a backup fails
    /// </summary>
    Task<Result> NotifyBackupFailedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string backupType,
        string errorMessage,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a restore starts
    /// </summary>
    Task<Result> NotifyRestoreStartedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a restore completes successfully
    /// </summary>
    Task<Result> NotifyRestoreCompletedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        TimeSpan duration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a restore fails
    /// </summary>
    Task<Result> NotifyRestoreFailedAsync(
        Guid tenantId,
        Guid backupId,
        string backupName,
        string errorMessage,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when old backups are cleaned up
    /// </summary>
    Task<Result> NotifyCleanupCompletedAsync(
        Guid tenantId,
        int deletedCount,
        long freedSpaceBytes,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends warning notification when storage is running low
    /// </summary>
    Task<Result> NotifyStorageWarningAsync(
        Guid tenantId,
        long usedBytes,
        long limitBytes,
        int percentageUsed,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Configuration for backup notifications
/// </summary>
public class BackupNotificationSettings
{
    public const string SectionName = "BackupNotifications";

    /// <summary>
    /// Enable email notifications for backup events
    /// </summary>
    public bool EnableEmailNotifications { get; set; } = true;

    /// <summary>
    /// Enable real-time (SignalR) notifications for backup events
    /// </summary>
    public bool EnableRealtimeNotifications { get; set; } = true;

    /// <summary>
    /// Send email notification on backup start
    /// </summary>
    public bool NotifyOnStart { get; set; } = false;

    /// <summary>
    /// Send email notification on backup completion
    /// </summary>
    public bool NotifyOnComplete { get; set; } = true;

    /// <summary>
    /// Send email notification on backup failure
    /// </summary>
    public bool NotifyOnFailure { get; set; } = true;

    /// <summary>
    /// Storage usage percentage threshold for warning notifications
    /// </summary>
    public int StorageWarningThreshold { get; set; } = 80;

    /// <summary>
    /// Email addresses to receive backup notifications (admin emails)
    /// </summary>
    public List<string> AdminEmailAddresses { get; set; } = new();
}
