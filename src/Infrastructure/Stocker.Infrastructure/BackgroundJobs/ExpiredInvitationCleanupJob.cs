using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Tenant.Enums;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for cleaning up expired user invitations.
/// Removes users in PendingActivation status whose activation tokens have expired.
/// This prevents expired invitations from consuming user limits.
/// </summary>
public class ExpiredInvitationCleanupJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpiredInvitationCleanupJob> _logger;

    public ExpiredInvitationCleanupJob(
        IServiceProvider serviceProvider,
        ILogger<ExpiredInvitationCleanupJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Cleans up expired user invitations across all tenants.
    /// Scheduled to run every day at 02:00 UTC.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("maintenance")]
    public async Task ExecuteAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<IMasterDbContext>();
        var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

        _logger.LogInformation("Starting expired invitation cleanup job");

        try
        {
            var now = DateTime.UtcNow;
            var totalCleaned = 0;
            var tenantsProcessed = 0;

            // Get all active tenants
            var tenants = await masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => new { t.Id, t.Name })
                .ToListAsync();

            _logger.LogInformation("Found {TenantCount} tenants to process", tenants.Count);

            foreach (var tenant in tenants)
            {
                try
                {
                    var tenantContext = await tenantDbContextFactory.CreateDbContextAsync(tenant.Id);
                    if (tenantContext == null)
                    {
                        _logger.LogWarning("Could not create context for tenant {TenantId}", tenant.Id);
                        continue;
                    }

                    // Find expired pending invitations
                    // Token expires after 7 days (set in TenantUser.CreateForInvitation)
                    var expiredUsers = await tenantContext.TenantUsers
                        .Where(u => u.Status == TenantUserStatus.PendingActivation &&
                                   u.PasswordResetTokenExpiry.HasValue &&
                                   u.PasswordResetTokenExpiry.Value < now)
                        .ToListAsync();

                    if (expiredUsers.Any())
                    {
                        _logger.LogInformation(
                            "Found {Count} expired invitations in tenant {TenantName} ({TenantId})",
                            expiredUsers.Count, tenant.Name, tenant.Id);

                        // Remove expired users
                        tenantContext.TenantUsers.RemoveRange(expiredUsers);
                        await tenantContext.SaveChangesAsync();

                        totalCleaned += expiredUsers.Count();
                    }

                    tenantsProcessed++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Error processing tenant {TenantId} for expired invitations",
                        tenant.Id);
                    // Continue with other tenants
                }
            }

            _logger.LogInformation(
                "Expired invitation cleanup completed. Processed {Tenants} tenants, cleaned {Total} expired invitations",
                tenantsProcessed, totalCleaned);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in expired invitation cleanup job");
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    /// <summary>
    /// Schedules the recurring expired invitation cleanup job.
    /// Call this during application startup.
    /// </summary>
    public static void Schedule()
    {
        // Run every day at 02:00 UTC (maintenance window)
        RecurringJob.AddOrUpdate<ExpiredInvitationCleanupJob>(
            "expired-invitation-cleanup",
            job => job.ExecuteAsync(),
            "0 2 * * *", // Every day at 02:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
