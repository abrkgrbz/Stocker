using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Infrastructure.BackgroundJobs;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Service for managing backup schedules and Hangfire recurring jobs
/// </summary>
public class BackupSchedulingService : IBackupSchedulingService
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<BackupSchedulingService> _logger;

    public BackupSchedulingService(
        IMasterDbContext masterDbContext,
        IBackgroundJobService backgroundJobService,
        ILogger<BackupSchedulingService> logger)
    {
        _masterDbContext = masterDbContext;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<BackupSchedule>> CreateScheduleAsync(
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate cron expression
            if (!IsValidCronExpression(cronExpression))
            {
                return Result<BackupSchedule>.Failure(
                    Error.Validation("Schedule.InvalidCron", "Invalid cron expression"));
            }

            // Create schedule
            var schedule = BackupSchedule.Create(
                tenantId,
                scheduleName,
                scheduleType,
                cronExpression,
                backupType,
                includeDatabase,
                includeFiles,
                includeConfiguration,
                compress,
                encrypt,
                retentionDays,
                createdBy);

            _masterDbContext.BackupSchedules.Add(schedule);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            // Create Hangfire recurring job
            var jobId = GetHangfireJobId(schedule.Id);
            _backgroundJobService.AddOrUpdateRecurringJob<BackupJob>(
                jobId,
                job => job.ExecuteScheduledBackupAsync(schedule.Id, CancellationToken.None),
                cronExpression);

            schedule.SetHangfireJobId(jobId);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Backup schedule created. TenantId: {TenantId}, ScheduleId: {ScheduleId}, Cron: {Cron}",
                tenantId, schedule.Id, cronExpression);

            return Result<BackupSchedule>.Success(schedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create backup schedule. TenantId: {TenantId}", tenantId);
            return Result<BackupSchedule>.Failure(
                Error.Failure("Schedule.CreateFailed", $"Failed to create schedule: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> UpdateScheduleAsync(
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            var schedule = await _masterDbContext.BackupSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

            if (schedule == null)
            {
                return Result.Failure(Error.NotFound("Schedule.NotFound", "Schedule not found"));
            }

            // Validate cron expression
            if (!IsValidCronExpression(cronExpression))
            {
                return Result.Failure(
                    Error.Validation("Schedule.InvalidCron", "Invalid cron expression"));
            }

            schedule.Update(
                scheduleName,
                scheduleType,
                cronExpression,
                backupType,
                includeDatabase,
                includeFiles,
                includeConfiguration,
                compress,
                encrypt,
                retentionDays,
                modifiedBy);

            // Update Hangfire job if schedule is enabled
            if (schedule.IsEnabled)
            {
                var jobId = schedule.HangfireJobId ?? GetHangfireJobId(schedule.Id);
                _backgroundJobService.AddOrUpdateRecurringJob<BackupJob>(
                    jobId,
                    job => job.ExecuteScheduledBackupAsync(schedule.Id, CancellationToken.None),
                    cronExpression);

                schedule.SetHangfireJobId(jobId);
            }

            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Backup schedule updated. ScheduleId: {ScheduleId}", scheduleId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update backup schedule. ScheduleId: {ScheduleId}", scheduleId);
            return Result.Failure(
                Error.Failure("Schedule.UpdateFailed", $"Failed to update schedule: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> EnableScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var schedule = await _masterDbContext.BackupSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

            if (schedule == null)
            {
                return Result.Failure(Error.NotFound("Schedule.NotFound", "Schedule not found"));
            }

            schedule.Enable();

            // Create Hangfire recurring job
            var jobId = schedule.HangfireJobId ?? GetHangfireJobId(schedule.Id);
            _backgroundJobService.AddOrUpdateRecurringJob<BackupJob>(
                jobId,
                job => job.ExecuteScheduledBackupAsync(schedule.Id, CancellationToken.None),
                schedule.CronExpression);

            schedule.SetHangfireJobId(jobId);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Backup schedule enabled. ScheduleId: {ScheduleId}", scheduleId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enable backup schedule. ScheduleId: {ScheduleId}", scheduleId);
            return Result.Failure(
                Error.Failure("Schedule.EnableFailed", $"Failed to enable schedule: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> DisableScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var schedule = await _masterDbContext.BackupSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

            if (schedule == null)
            {
                return Result.Failure(Error.NotFound("Schedule.NotFound", "Schedule not found"));
            }

            schedule.Disable();

            // Remove Hangfire recurring job
            if (!string.IsNullOrEmpty(schedule.HangfireJobId))
            {
                _backgroundJobService.RemoveRecurringJob(schedule.HangfireJobId);
            }

            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Backup schedule disabled. ScheduleId: {ScheduleId}", scheduleId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to disable backup schedule. ScheduleId: {ScheduleId}", scheduleId);
            return Result.Failure(
                Error.Failure("Schedule.DisableFailed", $"Failed to disable schedule: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> DeleteScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var schedule = await _masterDbContext.BackupSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

            if (schedule == null)
            {
                return Result.Failure(Error.NotFound("Schedule.NotFound", "Schedule not found"));
            }

            // Remove Hangfire recurring job
            if (!string.IsNullOrEmpty(schedule.HangfireJobId))
            {
                _backgroundJobService.RemoveRecurringJob(schedule.HangfireJobId);
            }

            _masterDbContext.BackupSchedules.Remove(schedule);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Backup schedule deleted. ScheduleId: {ScheduleId}", scheduleId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete backup schedule. ScheduleId: {ScheduleId}", scheduleId);
            return Result.Failure(
                Error.Failure("Schedule.DeleteFailed", $"Failed to delete schedule: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<IEnumerable<BackupSchedule>>> GetSchedulesAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var schedules = await _masterDbContext.BackupSchedules
                .Where(s => s.TenantId == tenantId)
                .OrderBy(s => s.ScheduleName)
                .ToListAsync(cancellationToken);

            return Result<IEnumerable<BackupSchedule>>.Success(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get backup schedules. TenantId: {TenantId}", tenantId);
            return Result<IEnumerable<BackupSchedule>>.Failure(
                Error.Failure("Schedule.GetFailed", $"Failed to get schedules: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<BackupSchedule>> GetScheduleAsync(
        Guid scheduleId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var schedule = await _masterDbContext.BackupSchedules
                .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

            if (schedule == null)
            {
                return Result<BackupSchedule>.Failure(
                    Error.NotFound("Schedule.NotFound", "Schedule not found"));
            }

            return Result<BackupSchedule>.Success(schedule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get backup schedule. ScheduleId: {ScheduleId}", scheduleId);
            return Result<BackupSchedule>.Failure(
                Error.Failure("Schedule.GetFailed", $"Failed to get schedule: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public string EnqueueManualBackup(Guid backupId)
    {
        return BackgroundJob.Enqueue<BackupJob>(
            job => job.ExecuteManualBackupAsync(backupId, CancellationToken.None));
    }

    /// <inheritdoc />
    public string EnqueueRestore(Guid tenantId, Guid backupId, bool restoreDatabase = true, bool restoreFiles = true, bool restoreConfiguration = true)
    {
        return BackgroundJob.Enqueue<BackupJob>(
            job => job.ExecuteRestoreAsync(tenantId, backupId, restoreDatabase, restoreFiles, restoreConfiguration, CancellationToken.None));
    }

    /// <inheritdoc />
    public string EnqueueCleanup(Guid tenantId, int retentionDays)
    {
        return BackgroundJob.Enqueue<BackupJob>(
            job => job.CleanupOldBackupsAsync(tenantId, retentionDays, CancellationToken.None));
    }

    private static string GetHangfireJobId(Guid scheduleId)
    {
        return $"backup-schedule-{scheduleId}";
    }

    private static bool IsValidCronExpression(string cronExpression)
    {
        try
        {
            Cronos.CronExpression.Parse(cronExpression);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
