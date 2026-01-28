using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Inventory.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for checking stock levels and sending reorder alerts.
/// Runs every 4 hours to identify products below reorder point.
/// </summary>
public class StockReorderAlertJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<StockReorderAlertJob> _logger;

    public StockReorderAlertJob(
        IServiceProvider serviceProvider,
        ILogger<StockReorderAlertJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Checks stock levels across all tenants and sends alerts for products below reorder point.
    /// Scheduled to run every 4 hours.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("default")]
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting stock reorder alert job");

        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var tenants = await tenantResolver.GetAllActiveTenantsAsync();

            _logger.LogInformation("Processing stock levels for {TenantCount} tenants", tenants.Count);

            var totalAlerts = 0;

            foreach (var tenant in tenants)
            {
                try
                {
                    var alerts = await CheckTenantStockLevels(tenant);
                    totalAlerts += alerts;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error checking stock levels for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation("Stock reorder alert job completed. Total alerts: {AlertCount}", totalAlerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in stock reorder alert job");
            throw;
        }
    }

    private async Task<int> CheckTenantStockLevels(TenantInfo tenant)
    {
        var alertCount = 0;

        using var tenantScope = _serviceProvider.CreateScope();
        var scopedProvider = tenantScope.ServiceProvider;

        // Set tenant context
        var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();
        backgroundTenantService.SetTenantInfo(tenant.Id, tenant.Name, tenant.ConnectionString);

        var inventoryContext = scopedProvider.GetRequiredService<InventoryDbContext>();

        try
        {
            // Find products with stock below reorder point
            var lowStockProducts = await inventoryContext.Stocks
                .Include(s => s.Product)
                .Include(s => s.Warehouse)
                .Where(s => s.Product != null && s.Product.ReorderPoint > 0)
                .Where(s => s.AvailableQuantity <= s.Product!.ReorderPoint)
                .Select(s => new
                {
                    ProductId = s.ProductId,
                    ProductName = s.Product!.Name,
                    ProductSku = s.Product.SKU,
                    WarehouseId = s.WarehouseId,
                    WarehouseName = s.Warehouse != null ? s.Warehouse.Name : "Unknown",
                    CurrentStock = s.AvailableQuantity,
                    ReorderPoint = s.Product.ReorderPoint,
                    ReorderQuantity = s.Product.ReorderQuantity
                })
                .ToListAsync();

            if (lowStockProducts.Any())
            {
                _logger.LogWarning(
                    "Tenant {TenantName}: {ProductCount} products below reorder point",
                    tenant.Name, lowStockProducts.Count);

                // Log each product for auditing
                foreach (var product in lowStockProducts)
                {
                    _logger.LogWarning(
                        "Low stock alert - Tenant: {TenantName}, Product: {ProductName} ({SKU}), " +
                        "Warehouse: {Warehouse}, Current: {Current}, Reorder Point: {ReorderPoint}",
                        tenant.Name, product.ProductName, product.ProductSku,
                        product.WarehouseName, product.CurrentStock, product.ReorderPoint);

                    alertCount++;
                }

                // NOTE: Email notification is disabled until IEmailService.SendStockAlertSummaryAsync is implemented
                // TODO: Implement email/SignalR notification for low stock alerts
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing stock levels for tenant {TenantName}", tenant.Name);
        }

        return alertCount;
    }

    /// <summary>
    /// Schedules the recurring stock reorder alert job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<StockReorderAlertJob>(
            "stock-reorder-alert",
            job => job.ExecuteAsync(),
            "0 */4 * * *", // Every 4 hours
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
