using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Reminders;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job for processing due reminders
/// </summary>
public class ReminderJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderJob> _logger;

    public ReminderJob(
        IServiceProvider serviceProvider,
        ILogger<ReminderJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Process all due reminders for all active tenants - runs every minute
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    public async Task ProcessDueReminders()
    {
        _logger.LogInformation("Starting reminder processing job for all tenants");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            // Get all active tenants
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing reminders for {TenantCount} active tenants", tenants.Count);

            var processedCount = 0;
            var errorCount = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    await ProcessTenantRemindersAsync(tenant);
                    processedCount++;
                }
                catch (Exception ex)
                {
                    errorCount++;
                    _logger.LogError(ex,
                        "Error processing reminders for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                    // Continue processing other tenants
                }
            }

            _logger.LogInformation(
                "Reminder processing completed. Processed: {ProcessedCount}, Errors: {ErrorCount}",
                processedCount, errorCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error in reminder processing job");
            throw;
        }
    }

    /// <summary>
    /// Process reminders for a specific tenant
    /// </summary>
    private async Task ProcessTenantRemindersAsync(TenantInfo tenant)
    {
        // Create a new scope for each tenant to ensure clean DbContext
        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(
            tenant.Id,
            tenant.Name,
            tenant.ConnectionString);

        _logger.LogDebug(
            "Processing reminders for tenant {TenantId} ({TenantName})",
            tenant.Id, tenant.Name);

        // Get reminder service with proper tenant context
        var reminderService = scopedProvider.GetRequiredService<IReminderService>();
        var result = await reminderService.ProcessDueRemindersAsync();

        if (!result.IsSuccess)
        {
            _logger.LogWarning(
                "Reminder processing returned error for tenant {TenantId}: {Error}",
                tenant.Id, result.Error?.Description);
        }
    }

    /// <summary>
    /// Register recurring job - called during application startup
    /// </summary>
    public static void RegisterRecurringJob()
    {
        RecurringJob.AddOrUpdate<ReminderJob>(
            "process-due-reminders",
            job => job.ProcessDueReminders(),
            Cron.Minutely);
    }
}
