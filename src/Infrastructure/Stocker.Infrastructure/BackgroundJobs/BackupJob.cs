using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenant.Backup.Commands;
using Stocker.Domain.Master.Entities;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job for executing scheduled backups
/// </summary>
public class BackupJob
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly IBackupExecutionService _backupExecutionService;
    private readonly IBackupStorageService _backupStorageService;
    private readonly IBackupNotificationService _notificationService;
    private readonly ILogger<BackupJob> _logger;

    public BackupJob(
        IMasterDbContext masterDbContext,
        IBackupExecutionService backupExecutionService,
        IBackupStorageService backupStorageService,
        IBackupNotificationService notificationService,
        ILogger<BackupJob> logger)
    {
        _masterDbContext = masterDbContext;
        _backupExecutionService = backupExecutionService;
        _backupStorageService = backupStorageService;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Executes a scheduled backup for a tenant
    /// </summary>
    [AutomaticRetry(Attempts = 3)]
    [Queue("backups")]
    public async Task ExecuteScheduledBackupAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting scheduled backup. ScheduleId: {ScheduleId}", scheduleId);

        try
        {
            // Get schedule details
            var schedule = await _masterDbContext.BackupSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

            if (schedule == null)
            {
                _logger.LogWarning("Backup schedule not found. ScheduleId: {ScheduleId}", scheduleId);
                return;
            }

            if (!schedule.IsEnabled)
            {
                _logger.LogInformation("Backup schedule is disabled. ScheduleId: {ScheduleId}", scheduleId);
                return;
            }

            // Create backup record
            var backup = TenantBackup.Create(
                schedule.TenantId,
                $"{schedule.ScheduleName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}",
                schedule.BackupType,
                "Scheduled",
                schedule.IncludeDatabase,
                schedule.IncludeFiles,
                schedule.IncludeConfiguration,
                schedule.Compress,
                schedule.Encrypt,
                $"Otomatik yedekleme - {schedule.ScheduleName}");

            _masterDbContext.TenantBackups.Add(backup);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            // Update backup status
            backup.StartBackup();
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            // Send start notification
            var startTime = DateTime.UtcNow;
            await _notificationService.NotifyBackupStartedAsync(
                schedule.TenantId,
                backup.Id,
                backup.BackupName,
                schedule.BackupType,
                cancellationToken);

            // Execute backup
            var request = new BackupExecutionRequest(
                TenantId: schedule.TenantId,
                BackupId: backup.Id,
                BackupName: backup.BackupName,
                BackupType: schedule.BackupType,
                IncludeDatabase: schedule.IncludeDatabase,
                IncludeFiles: schedule.IncludeFiles,
                IncludeConfiguration: schedule.IncludeConfiguration,
                Compress: schedule.Compress,
                Encrypt: schedule.Encrypt,
                Description: backup.Description);

            var result = await _backupExecutionService.ExecuteBackupAsync(request, cancellationToken);
            var duration = DateTime.UtcNow - startTime;

            if (result.IsSuccess)
            {
                // Update backup with success
                backup.CompleteBackup(
                    result.Value.SizeInBytes,
                    result.Value.FilePath,
                    result.Value.StorageLocation,
                    result.Value.DownloadUrl,
                    DateTime.UtcNow.AddDays(schedule.RetentionDays));

                // Update schedule
                schedule.RecordExecution(true);

                // Send success notification
                await _notificationService.NotifyBackupCompletedAsync(
                    schedule.TenantId,
                    backup.Id,
                    backup.BackupName,
                    schedule.BackupType,
                    result.Value.SizeInBytes,
                    duration,
                    cancellationToken);

                _logger.LogInformation(
                    "Scheduled backup completed successfully. ScheduleId: {ScheduleId}, BackupId: {BackupId}, Size: {Size}",
                    scheduleId, backup.Id, result.Value.SizeInBytes);
            }
            else
            {
                // Update backup with failure
                backup.FailBackup(result.Error.Description);
                schedule.RecordExecution(false, result.Error.Description);

                // Send failure notification
                await _notificationService.NotifyBackupFailedAsync(
                    schedule.TenantId,
                    backup.Id,
                    backup.BackupName,
                    schedule.BackupType,
                    result.Error.Description,
                    cancellationToken);

                _logger.LogError(
                    "Scheduled backup failed. ScheduleId: {ScheduleId}, BackupId: {BackupId}, Error: {Error}",
                    scheduleId, backup.Id, result.Error.Description);
            }

            await _masterDbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error executing scheduled backup. ScheduleId: {ScheduleId}",
                scheduleId);
            throw; // Rethrow to trigger Hangfire retry
        }
    }

    /// <summary>
    /// Executes a manual backup for a tenant
    /// </summary>
    [Queue("backups")]
    public async Task ExecuteManualBackupAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting manual backup. BackupId: {BackupId}", backupId);

        try
        {
            // Get backup record
            var backup = await _masterDbContext.TenantBackups
                .FirstOrDefaultAsync(b => b.Id == backupId, cancellationToken);

            if (backup == null)
            {
                _logger.LogWarning("Backup not found. BackupId: {BackupId}", backupId);
                return;
            }

            // Update status to in progress
            backup.StartBackup();
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            // Send start notification
            var startTime = DateTime.UtcNow;
            await _notificationService.NotifyBackupStartedAsync(
                backup.TenantId,
                backup.Id,
                backup.BackupName,
                backup.BackupType,
                cancellationToken);

            // Execute backup
            var request = new BackupExecutionRequest(
                TenantId: backup.TenantId,
                BackupId: backup.Id,
                BackupName: backup.BackupName,
                BackupType: backup.BackupType,
                IncludeDatabase: backup.IncludesDatabase,
                IncludeFiles: backup.IncludesFiles,
                IncludeConfiguration: backup.IncludesConfiguration,
                Compress: backup.IsCompressed,
                Encrypt: backup.IsEncrypted,
                Description: backup.Description);

            var result = await _backupExecutionService.ExecuteBackupAsync(request, cancellationToken);
            var duration = DateTime.UtcNow - startTime;

            if (result.IsSuccess)
            {
                backup.CompleteBackup(
                    result.Value.SizeInBytes,
                    result.Value.FilePath,
                    result.Value.StorageLocation,
                    result.Value.DownloadUrl);

                // Send success notification
                await _notificationService.NotifyBackupCompletedAsync(
                    backup.TenantId,
                    backup.Id,
                    backup.BackupName,
                    backup.BackupType,
                    result.Value.SizeInBytes,
                    duration,
                    cancellationToken);

                _logger.LogInformation(
                    "Manual backup completed successfully. BackupId: {BackupId}, Size: {Size}",
                    backupId, result.Value.SizeInBytes);
            }
            else
            {
                backup.FailBackup(result.Error.Description);

                // Send failure notification
                await _notificationService.NotifyBackupFailedAsync(
                    backup.TenantId,
                    backup.Id,
                    backup.BackupName,
                    backup.BackupType,
                    result.Error.Description,
                    cancellationToken);

                _logger.LogError(
                    "Manual backup failed. BackupId: {BackupId}, Error: {Error}",
                    backupId, result.Error.Description);
            }

            await _masterDbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing manual backup. BackupId: {BackupId}", backupId);

            // Try to update backup status
            try
            {
                var backup = await _masterDbContext.TenantBackups
                    .FirstOrDefaultAsync(b => b.Id == backupId, cancellationToken);

                if (backup != null)
                {
                    backup.FailBackup(ex.Message);
                    await _masterDbContext.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception updateEx)
            {
                _logger.LogError(updateEx, "Failed to update backup status after error. BackupId: {BackupId}", backupId);
            }

            throw;
        }
    }

    /// <summary>
    /// Cleans up old backups based on retention policy
    /// </summary>
    [AutomaticRetry(Attempts = 3)]
    [Queue("maintenance")]
    public async Task CleanupOldBackupsAsync(Guid tenantId, int retentionDays, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Starting backup cleanup. TenantId: {TenantId}, RetentionDays: {RetentionDays}",
            tenantId, retentionDays);

        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

            // Get expired backups
            var expiredBackups = await _masterDbContext.TenantBackups
                .Where(b => b.TenantId == tenantId
                    && b.Status == "Completed"
                    && b.CreatedAt < cutoffDate
                    && (b.ExpiresAt == null || b.ExpiresAt < DateTime.UtcNow))
                .ToListAsync(cancellationToken);

            var deletedCount = 0;
            var failedCount = 0;

            foreach (var backup in expiredBackups)
            {
                try
                {
                    // Delete files from MinIO storage
                    var deleteResult = await _backupStorageService.DeleteBackupAsync(
                        tenantId,
                        backup.Id,
                        cancellationToken);

                    if (deleteResult.IsSuccess)
                    {
                        backup.MarkAsDeleted();
                        deletedCount++;

                        _logger.LogDebug(
                            "Deleted backup files from storage. BackupId: {BackupId}",
                            backup.Id);
                    }
                    else
                    {
                        // Mark as deleted anyway since the DB record is expired
                        // Storage files will be orphaned but won't affect functionality
                        backup.MarkAsDeleted();
                        failedCount++;

                        _logger.LogWarning(
                            "Failed to delete backup files from storage, but marked as deleted. BackupId: {BackupId}, Error: {Error}",
                            backup.Id, deleteResult.Error.Description);
                    }
                }
                catch (Exception ex)
                {
                    // Mark as deleted anyway to prevent re-processing
                    backup.MarkAsDeleted();
                    failedCount++;

                    _logger.LogWarning(ex,
                        "Error deleting backup files from storage, but marked as deleted. BackupId: {BackupId}",
                        backup.Id);
                }
            }

            if (expiredBackups.Any())
            {
                await _masterDbContext.SaveChangesAsync(cancellationToken);

                _logger.LogInformation(
                    "Backup cleanup completed. TenantId: {TenantId}, Deleted: {DeletedCount}, Failed: {FailedCount}",
                    tenantId, deletedCount, failedCount);
            }
            else
            {
                _logger.LogInformation(
                    "No expired backups found. TenantId: {TenantId}",
                    tenantId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up old backups. TenantId: {TenantId}", tenantId);
            throw;
        }
    }

    /// <summary>
    /// Global cleanup job for all tenants
    /// </summary>
    [AutomaticRetry(Attempts = 2)]
    [Queue("maintenance")]
    public async Task CleanupAllExpiredBackupsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting global backup cleanup for all tenants");

        try
        {
            // Get all expired backups across all tenants
            var expiredBackups = await _masterDbContext.TenantBackups
                .Where(b => b.Status == "Completed"
                    && b.ExpiresAt != null
                    && b.ExpiresAt < DateTime.UtcNow)
                .GroupBy(b => b.TenantId)
                .ToListAsync(cancellationToken);

            var totalDeleted = 0;
            var totalFailed = 0;

            foreach (var tenantGroup in expiredBackups)
            {
                foreach (var backup in tenantGroup)
                {
                    try
                    {
                        var deleteResult = await _backupStorageService.DeleteBackupAsync(
                            backup.TenantId,
                            backup.Id,
                            cancellationToken);

                        backup.MarkAsDeleted();

                        if (deleteResult.IsSuccess)
                        {
                            totalDeleted++;
                        }
                        else
                        {
                            totalFailed++;
                        }
                    }
                    catch (Exception ex)
                    {
                        backup.MarkAsDeleted();
                        totalFailed++;
                        _logger.LogWarning(ex, "Error deleting backup. BackupId: {BackupId}", backup.Id);
                    }
                }
            }

            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Global backup cleanup completed. TotalDeleted: {TotalDeleted}, TotalFailed: {TotalFailed}",
                totalDeleted, totalFailed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during global backup cleanup");
            throw;
        }
    }
}
