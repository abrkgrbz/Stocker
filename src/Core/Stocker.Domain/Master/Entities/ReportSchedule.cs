using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Scheduled report definition for automated report generation
/// </summary>
public sealed class ReportSchedule : Entity
{
    public string Name { get; private set; }
    public string ReportType { get; private set; }
    public ReportFrequency Frequency { get; private set; }
    public string CronExpression { get; private set; }
    public bool IsEnabled { get; private set; }
    public string Recipients { get; private set; } // JSON array of emails
    public string? Parameters { get; private set; } // JSON for report parameters
    public DateTime? LastRunAt { get; private set; }
    public DateTime? NextRunAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private ReportSchedule() : base() { } // EF Core

    private ReportSchedule(
        string name,
        string reportType,
        ReportFrequency frequency,
        string cronExpression,
        string recipients,
        string createdBy) : base(Guid.NewGuid())
    {
        Name = name;
        ReportType = reportType;
        Frequency = frequency;
        CronExpression = cronExpression;
        Recipients = recipients;
        CreatedBy = createdBy;
        IsEnabled = true;
        CreatedAt = DateTime.UtcNow;
        NextRunAt = CalculateNextRunTime(cronExpression);
    }

    public static ReportSchedule Create(
        string name,
        string reportType,
        ReportFrequency frequency,
        string cronExpression,
        string recipients,
        string createdBy,
        string? parameters = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Report name cannot be empty", nameof(name));

        if (string.IsNullOrWhiteSpace(reportType))
            throw new ArgumentException("Report type cannot be empty", nameof(reportType));

        if (string.IsNullOrWhiteSpace(cronExpression))
            throw new ArgumentException("Cron expression cannot be empty", nameof(cronExpression));

        if (string.IsNullOrWhiteSpace(recipients))
            throw new ArgumentException("Recipients cannot be empty", nameof(recipients));

        var schedule = new ReportSchedule(name, reportType, frequency, cronExpression, recipients, createdBy)
        {
            Parameters = parameters
        };

        return schedule;
    }

    /// <summary>
    /// Enable the schedule
    /// </summary>
    public void Enable()
    {
        if (IsEnabled)
            return;

        IsEnabled = true;
        NextRunAt = CalculateNextRunTime(CronExpression);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Disable the schedule
    /// </summary>
    public void Disable()
    {
        if (!IsEnabled)
            return;

        IsEnabled = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Update schedule configuration
    /// </summary>
    public void Update(
        string? name = null,
        string? cronExpression = null,
        string? recipients = null,
        string? parameters = null)
    {
        if (name != null)
            Name = name;

        if (cronExpression != null)
        {
            CronExpression = cronExpression;
            NextRunAt = CalculateNextRunTime(cronExpression);
        }

        if (recipients != null)
            Recipients = recipients;

        if (parameters != null)
            Parameters = parameters;

        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Mark as run and calculate next run time
    /// </summary>
    public void MarkAsRun()
    {
        LastRunAt = DateTime.UtcNow;
        NextRunAt = CalculateNextRunTime(CronExpression);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Calculate next run time from cron expression (simplified implementation)
    /// </summary>
    private static DateTime? CalculateNextRunTime(string cronExpression)
    {
        // Simplified: In production, use a proper cron parser like NCrontab
        // For now, return a fixed time based on common patterns
        var now = DateTime.UtcNow;

        return cronExpression switch
        {
            "0 8 * * *" => now.Date.AddDays(1).AddHours(8), // Daily at 8 AM
            "0 8 * * 1" => GetNextDayOfWeek(now, DayOfWeek.Monday).AddHours(8), // Weekly on Monday
            "0 8 1 * *" => new DateTime(now.Year, now.Month, 1).AddMonths(1).AddHours(8), // Monthly
            _ => now.AddDays(1) // Default to next day
        };
    }

    private static DateTime GetNextDayOfWeek(DateTime from, DayOfWeek dayOfWeek)
    {
        int daysUntil = ((int)dayOfWeek - (int)from.DayOfWeek + 7) % 7;
        if (daysUntil == 0) daysUntil = 7;
        return from.Date.AddDays(daysUntil);
    }
}
