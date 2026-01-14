using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing backup schedules
/// </summary>
public interface IBackupSchedulingService
{
    /// <summary>
    /// Creates a new backup schedule
    /// </summary>
    Task<Result<BackupSchedule>> CreateScheduleAsync(
        Guid tenantId,
        string scheduleName,
        string scheduleType,
        string cronExpression,
        string backupType,
        bool includeDatabase,
        bool includeFiles,
        bool includeConfiguration,
        bool compress,
        bool encrypt,
        int retentionDays,
        string? createdBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing backup schedule
    /// </summary>
    Task<Result> UpdateScheduleAsync(
        Guid scheduleId,
        string scheduleName,
        string scheduleType,
        string cronExpression,
        string backupType,
        bool includeDatabase,
        bool includeFiles,
        bool includeConfiguration,
        bool compress,
        bool encrypt,
        int retentionDays,
        string? modifiedBy = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enables a backup schedule
    /// </summary>
    Task<Result> EnableScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Disables a backup schedule
    /// </summary>
    Task<Result> DisableScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a backup schedule
    /// </summary>
    Task<Result> DeleteScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all backup schedules for a tenant
    /// </summary>
    Task<Result<IEnumerable<BackupSchedule>>> GetSchedulesAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific backup schedule
    /// </summary>
    Task<Result<BackupSchedule>> GetScheduleAsync(
        Guid scheduleId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enqueues a manual backup job
    /// </summary>
    /// <returns>Hangfire job ID</returns>
    string EnqueueManualBackup(Guid backupId);

    /// <summary>
    /// Enqueues a restore job
    /// </summary>
    /// <returns>Hangfire job ID</returns>
    string EnqueueRestore(Guid tenantId, Guid backupId, bool restoreDatabase = true, bool restoreFiles = true, bool restoreConfiguration = true);

    /// <summary>
    /// Enqueues a cleanup job for old backups
    /// </summary>
    /// <returns>Hangfire job ID</returns>
    string EnqueueCleanup(Guid tenantId, int retentionDays);
}
