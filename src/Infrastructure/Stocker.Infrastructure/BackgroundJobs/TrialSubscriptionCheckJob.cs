using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for checking trial subscription expiration
/// and sending reminder notifications
/// </summary>
public class TrialSubscriptionCheckJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TrialSubscriptionCheckJob> _logger;

    public TrialSubscriptionCheckJob(
        IServiceProvider serviceProvider,
        ILogger<TrialSubscriptionCheckJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Checks all trial subscriptions and sends reminders for expiring ones
    /// Scheduled to run every day at 09:00 UTC
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    public async Task ExecuteAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<IMasterDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        _logger.LogInformation("Starting trial subscription check job");

        try
        {
            var now = DateTime.UtcNow;

            // Get all trial subscriptions
            var trialSubscriptions = await masterContext.Subscriptions
                .Include(s => s.Tenant)
                .Where(s => s.Status == SubscriptionStatus.Deneme && s.TrialEndDate.HasValue)
                .ToListAsync();

            _logger.LogInformation("Found {Count} trial subscriptions to check", trialSubscriptions.Count);

            var expiredCount = 0;
            var warningCount = 0;

            foreach (var subscription in trialSubscriptions)
            {
                var trialEnd = subscription.TrialEndDate!.Value;
                var daysRemaining = (trialEnd - now).TotalDays;

                // Trial expired - suspend subscription
                if (daysRemaining <= 0)
                {
                    subscription.Suspend("Trial period expired");
                    expiredCount++;

                    _logger.LogInformation(
                        "Trial expired for Tenant {TenantId}. Subscription suspended.",
                        subscription.TenantId);

                    // Send trial expired email
                    if (subscription.Tenant?.ContactEmail != null)
                    {
                        try
                        {
                            await emailService.SendTrialExpiredEmailAsync(
                                subscription.Tenant.ContactEmail.Value,
                                subscription.Tenant.Name);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to send trial expired email for tenant {TenantId}",
                                subscription.TenantId);
                        }
                    }
                }
                // 3 days remaining - send warning
                else if (daysRemaining <= 3 && daysRemaining > 2)
                {
                    warningCount++;

                    if (subscription.Tenant?.ContactEmail != null)
                    {
                        try
                        {
                            await emailService.SendTrialExpiringEmailAsync(
                                subscription.Tenant.ContactEmail.Value,
                                subscription.Tenant.Name,
                                (int)Math.Ceiling(daysRemaining));
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to send trial expiring email for tenant {TenantId}",
                                subscription.TenantId);
                        }
                    }
                }
                // 7 days remaining - send reminder
                else if (daysRemaining <= 7 && daysRemaining > 6)
                {
                    warningCount++;

                    if (subscription.Tenant?.ContactEmail != null)
                    {
                        try
                        {
                            await emailService.SendTrialExpiringEmailAsync(
                                subscription.Tenant.ContactEmail.Value,
                                subscription.Tenant.Name,
                                (int)Math.Ceiling(daysRemaining));
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to send trial reminder email for tenant {TenantId}",
                                subscription.TenantId);
                        }
                    }
                }
            }

            await masterContext.SaveChangesAsync();

            _logger.LogInformation(
                "Trial subscription check completed. Expired: {Expired}, Warnings sent: {Warnings}",
                expiredCount, warningCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in trial subscription check job");
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    /// <summary>
    /// Schedules the recurring trial check job
    /// Call this during application startup
    /// </summary>
    public static void Schedule()
    {
        // Run every day at 09:00 UTC
        RecurringJob.AddOrUpdate<TrialSubscriptionCheckJob>(
            "trial-subscription-check",
            job => job.ExecuteAsync(),
            "0 9 * * *", // Every day at 09:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
