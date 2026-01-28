using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Sales.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for checking quotation expiry dates and updating status.
/// Runs daily at 01:00 UTC to identify and expire overdue quotations.
/// </summary>
public class QuotationExpiryCheckJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<QuotationExpiryCheckJob> _logger;

    public QuotationExpiryCheckJob(
        IServiceProvider serviceProvider,
        ILogger<QuotationExpiryCheckJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Checks quotation expiry dates across all tenants.
    /// Expired quotations are marked as expired and notifications are logged.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("default")]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting quotation expiry check job");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing quotations for {TenantCount} tenants", tenants.Count);

            var totalExpired = 0;
            var totalExpiringSoon = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    var (expired, expiringSoon) = await ProcessTenantQuotations(tenant);
                    totalExpired += expired;
                    totalExpiringSoon += expiringSoon;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error processing quotations for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation(
                "Quotation expiry check completed. Expired: {Expired}, Expiring Soon: {ExpiringSoon}",
                totalExpired, totalExpiringSoon);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in quotation expiry check job");
            throw;
        }
    }

    private async Task<(int expired, int expiringSoon)> ProcessTenantQuotations(TenantInfo tenant)
    {
        var expiredCount = 0;
        var expiringSoonCount = 0;
        var today = DateTime.UtcNow.Date;
        var warningDate = today.AddDays(3); // 3 days warning

        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenant.Id, tenant.Name, tenant.ConnectionString);

        var salesContext = scopedProvider.GetRequiredService<SalesDbContext>();

        try
        {
            // Find and update expired quotations
            var expiredQuotations = await salesContext.Quotations
                .Where(q => q.ExpirationDate < today)
                .Where(q => q.Status != QuotationStatus.Expired)
                .Where(q => q.Status != QuotationStatus.Converted)
                .Where(q => q.Status != QuotationStatus.Cancelled)
                .ToListAsync();

            foreach (var quotation in expiredQuotations)
            {
                quotation.Expire();
                expiredCount++;

                _logger.LogInformation(
                    "Quotation expired - Tenant: {TenantName}, QuotationNo: {QuotationNo}, ExpirationDate: {ExpirationDate}",
                    tenant.Name, quotation.QuotationNumber, quotation.ExpirationDate);
            }

            if (expiredQuotations.Any())
            {
                await salesContext.SaveChangesAsync();
            }

            // Find quotations expiring soon (warning)
            var expiringSoon = await salesContext.Quotations
                .Where(q => q.ExpirationDate >= today && q.ExpirationDate <= warningDate)
                .Where(q => q.Status == QuotationStatus.Sent ||
                           q.Status == QuotationStatus.Draft)
                .Select(q => new { q.QuotationNumber, q.ExpirationDate })
                .ToListAsync();

            foreach (var quotation in expiringSoon)
            {
                _logger.LogWarning(
                    "Quotation expiring soon - Tenant: {TenantName}, QuotationNo: {QuotationNo}, ExpirationDate: {ExpirationDate}",
                    tenant.Name, quotation.QuotationNumber, quotation.ExpirationDate);
                expiringSoonCount++;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing quotations for tenant {TenantName}", tenant.Name);
        }

        return (expiredCount, expiringSoonCount);
    }

    /// <summary>
    /// Schedules the recurring quotation expiry check job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<QuotationExpiryCheckJob>(
            "quotation-expiry-check",
            job => job.ExecuteAsync(),
            "0 1 * * *", // Daily at 01:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
