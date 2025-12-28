using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Represents a scheduled backup configuration for a tenant
/// </summary>
public sealed class BackupSchedule : Entity
{
    private BackupSchedule() { }

    private BackupSchedule(
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
        int retentionDays)
    {
        TenantId = tenantId;
        ScheduleName = scheduleName;
        ScheduleType = scheduleType;
        CronExpression = cronExpression;
        BackupType = backupType;
        IncludeDatabase = includeDatabase;
        IncludeFiles = includeFiles;
        IncludeConfiguration = includeConfiguration;
        Compress = compress;
        Encrypt = encrypt;
        RetentionDays = retentionDays;
        IsEnabled = true;
        CreatedAt = DateTime.UtcNow;
        LastModifiedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Tenant that owns this backup schedule
    /// </summary>
    public Guid TenantId { get; private set; }

    /// <summary>
    /// Name of the schedule (e.g., "Daily Backup", "Weekly Full Backup")
    /// </summary>
    public string ScheduleName { get; private set; } = default!;

    /// <summary>
    /// Type of schedule: Daily, Weekly, Monthly, Custom
    /// </summary>
    public string ScheduleType { get; private set; } = default!;

    /// <summary>
    /// Cron expression for schedule timing
    /// Examples:
    /// - "0 2 * * *" = Daily at 2 AM
    /// - "0 3 * * 0" = Weekly on Sunday at 3 AM
    /// - "0 4 1 * *" = Monthly on 1st at 4 AM
    /// </summary>
    public string CronExpression { get; private set; } = default!;

    /// <summary>
    /// Backup type: Full, Incremental, Differential
    /// </summary>
    public string BackupType { get; private set; } = default!;

    /// <summary>
    /// Whether to include database in backup
    /// </summary>
    public bool IncludeDatabase { get; private set; }

    /// <summary>
    /// Whether to include files in backup
    /// </summary>
    public bool IncludeFiles { get; private set; }

    /// <summary>
    /// Whether to include configuration in backup
    /// </summary>
    public bool IncludeConfiguration { get; private set; }

    /// <summary>
    /// Whether to compress the backup
    /// </summary>
    public bool Compress { get; private set; }

    /// <summary>
    /// Whether to encrypt the backup
    /// </summary>
    public bool Encrypt { get; private set; }

    /// <summary>
    /// Number of days to retain backups before auto-deletion
    /// </summary>
    public int RetentionDays { get; private set; }

    /// <summary>
    /// Whether the schedule is enabled
    /// </summary>
    public bool IsEnabled { get; private set; }

    /// <summary>
    /// Hangfire recurring job ID for this schedule
    /// </summary>
    public string? HangfireJobId { get; private set; }

    /// <summary>
    /// Last time backup was executed
    /// </summary>
    public DateTime? LastExecutedAt { get; private set; }

    /// <summary>
    /// Next scheduled execution time
    /// </summary>
    public DateTime? NextExecutionAt { get; private set; }

    /// <summary>
    /// Number of successful executions
    /// </summary>
    public int SuccessCount { get; private set; }

    /// <summary>
    /// Number of failed executions
    /// </summary>
    public int FailureCount { get; private set; }

    /// <summary>
    /// Last error message if failed
    /// </summary>
    public string? LastErrorMessage { get; private set; }

    /// <summary>
    /// When the schedule was created
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// When the schedule was last modified
    /// </summary>
    public DateTime LastModifiedAt { get; private set; }

    /// <summary>
    /// Who created the schedule
    /// </summary>
    public string? CreatedBy { get; private set; }

    /// <summary>
    /// Who last modified the schedule
    /// </summary>
    public string? ModifiedBy { get; private set; }

    // Navigation property
    public Tenant Tenant { get; private set; } = default!;

    // Factory method
    public static BackupSchedule Create(
        Guid tenantId,
        string scheduleName,
        string scheduleType,
        string cronExpression,
        string backupType,
        bool includeDatabase = true,
        bool includeFiles = false,
        bool includeConfiguration = true,
        bool compress = true,
        bool encrypt = false,
        int retentionDays = 30,
        string? createdBy = null)
    {
        var schedule = new BackupSchedule(
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
            retentionDays);

        schedule.CreatedBy = createdBy;
        return schedule;
    }

    public void Update(
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
        string? modifiedBy = null)
    {
        ScheduleName = scheduleName;
        ScheduleType = scheduleType;
        CronExpression = cronExpression;
        BackupType = backupType;
        IncludeDatabase = includeDatabase;
        IncludeFiles = includeFiles;
        IncludeConfiguration = includeConfiguration;
        Compress = compress;
        Encrypt = encrypt;
        RetentionDays = retentionDays;
        LastModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }

    public void SetHangfireJobId(string jobId)
    {
        HangfireJobId = jobId;
        LastModifiedAt = DateTime.UtcNow;
    }

    public void Enable()
    {
        IsEnabled = true;
        LastModifiedAt = DateTime.UtcNow;
    }

    public void Disable()
    {
        IsEnabled = false;
        LastModifiedAt = DateTime.UtcNow;
    }

    public void RecordExecution(bool success, string? errorMessage = null)
    {
        LastExecutedAt = DateTime.UtcNow;

        if (success)
        {
            SuccessCount++;
            LastErrorMessage = null;
        }
        else
        {
            FailureCount++;
            LastErrorMessage = errorMessage;
        }

        LastModifiedAt = DateTime.UtcNow;
    }

    public void SetNextExecution(DateTime nextExecution)
    {
        NextExecutionAt = nextExecution;
    }
}
