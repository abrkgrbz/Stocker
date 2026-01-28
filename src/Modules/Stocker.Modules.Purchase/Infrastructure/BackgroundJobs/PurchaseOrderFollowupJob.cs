using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for following up on pending purchase orders.
/// Runs daily at 10:00 UTC to identify overdue deliveries and pending approvals.
/// </summary>
public class PurchaseOrderFollowupJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PurchaseOrderFollowupJob> _logger;

    public PurchaseOrderFollowupJob(
        IServiceProvider serviceProvider,
        ILogger<PurchaseOrderFollowupJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Processes pending purchase orders across all tenants.
    /// Identifies overdue deliveries and orders requiring attention.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("default")]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting purchase order followup job");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing purchase orders for {TenantCount} tenants", tenants.Count);

            var totalOverdue = 0;
            var totalPendingApproval = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    var (overdue, pending) = await ProcessTenantPurchaseOrders(tenant);
                    totalOverdue += overdue;
                    totalPendingApproval += pending;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error processing purchase orders for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation(
                "Purchase order followup completed. Overdue: {Overdue}, Pending Approval: {Pending}",
                totalOverdue, totalPendingApproval);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in purchase order followup job");
            throw;
        }
    }

    private async Task<(int overdue, int pendingApproval)> ProcessTenantPurchaseOrders(TenantInfo tenant)
    {
        var overdueCount = 0;
        var pendingApprovalCount = 0;
        var today = DateTime.UtcNow.Date;

        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenant.Id, tenant.Name, tenant.ConnectionString);

        var purchaseContext = scopedProvider.GetRequiredService<PurchaseDbContext>();

        try
        {
            // Find overdue purchase orders (expected delivery date passed)
            var overdueOrders = await purchaseContext.PurchaseOrders
                .Where(po => po.ExpectedDeliveryDate.HasValue && po.ExpectedDeliveryDate < today)
                .Where(po => po.Status == PurchaseOrderStatus.Confirmed ||
                            po.Status == PurchaseOrderStatus.PartiallyReceived)
                .Select(po => new
                {
                    po.OrderNumber,
                    po.SupplierName,
                    po.ExpectedDeliveryDate,
                    po.Status,
                    DaysOverdue = (today - po.ExpectedDeliveryDate!.Value).Days
                })
                .ToListAsync();

            foreach (var order in overdueOrders)
            {
                _logger.LogWarning(
                    "Overdue PO - Tenant: {TenantName}, PONo: {PONumber}, Supplier: {Supplier}, " +
                    "Expected: {ExpectedDate}, Days Overdue: {DaysOverdue}",
                    tenant.Name, order.OrderNumber, order.SupplierName,
                    order.ExpectedDeliveryDate, order.DaysOverdue);
                overdueCount++;
            }

            // Find pending approval orders (older than 3 days)
            var oldPendingDate = today.AddDays(-3);
            var pendingApprovals = await purchaseContext.PurchaseOrders
                .Where(po => po.Status == PurchaseOrderStatus.Draft ||
                            po.Status == PurchaseOrderStatus.PendingApproval)
                .Where(po => po.CreatedAt < oldPendingDate)
                .Select(po => new { po.OrderNumber, po.CreatedAt, po.Status })
                .ToListAsync();

            foreach (var order in pendingApprovals)
            {
                _logger.LogWarning(
                    "PO Pending Approval - Tenant: {TenantName}, PONo: {PONumber}, " +
                    "Created: {CreatedAt}, Status: {Status}",
                    tenant.Name, order.OrderNumber, order.CreatedAt, order.Status);
                pendingApprovalCount++;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing purchase orders for tenant {TenantName}", tenant.Name);
        }

        return (overdueCount, pendingApprovalCount);
    }

    /// <summary>
    /// Schedules the recurring purchase order followup job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<PurchaseOrderFollowupJob>(
            "purchase-order-followup",
            job => job.ExecuteAsync(),
            "0 10 * * *", // Daily at 10:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
