using Hangfire;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Reminders;

namespace Stocker.Modules.CRM.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job for processing due reminders
/// </summary>
public class ReminderJob
{
    private readonly IReminderService _reminderService;
    private readonly ILogger<ReminderJob> _logger;

    public ReminderJob(
        IReminderService reminderService,
        ILogger<ReminderJob> logger)
    {
        _reminderService = reminderService;
        _logger = logger;
    }

    /// <summary>
    /// Process all due reminders - runs every minute
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    public async Task ProcessDueReminders()
    {
        _logger.LogInformation("Starting reminder processing job");

        var result = await _reminderService.ProcessDueRemindersAsync();

        if (!result.IsSuccess)
        {
            _logger.LogError("Reminder processing failed: {Error}", result.Error?.Description);
            throw new Exception($"Reminder processing failed: {result.Error?.Description}");
        }

        _logger.LogInformation("Reminder processing job completed successfully");
    }

    /// <summary>
    /// Register recurring job - called during application startup
    /// </summary>
    public static void RegisterRecurringJob()
    {
        // Run every minute to check for due reminders
        RecurringJob.AddOrUpdate<ReminderJob>(
            "process-due-reminders",
            job => job.ProcessDueReminders(),
            Cron.Minutely);
    }
}
