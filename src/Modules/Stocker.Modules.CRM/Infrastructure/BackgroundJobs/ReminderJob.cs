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
        // TODO: Implement multi-tenant support for background jobs
        // Currently disabled because job runs without tenant context
        // causing "Tenant connection string is not available" error

        // SOLUTION OPTIONS:
        // 1. Create separate job per tenant: RecurringJob.AddOrUpdate($"reminders-{tenantId}", ...)
        // 2. Iterate through all tenants in job: foreach(tenant) ProcessDueReminders(tenant.Id)
        // 3. Use ITenantService.SetCurrentTenant() before CRM operations

        // TEMPORARILY DISABLED until proper multi-tenant job architecture is implemented
        /*
        RecurringJob.AddOrUpdate<ReminderJob>(
            "process-due-reminders",
            job => job.ProcessDueReminders(),
            Cron.Minutely);
        */
    }
}
