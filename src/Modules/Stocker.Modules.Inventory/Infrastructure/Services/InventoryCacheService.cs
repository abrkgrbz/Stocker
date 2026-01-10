using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Memory-based implementation of inventory cache service.
/// </summary>
public class InventoryCacheService : IInventoryCacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<InventoryCacheService> _logger;

    // Cache key prefixes
    private const string ProductPrefix = "inventory:product";
    private const string StockPrefix = "inventory:stock";
    private const string PriceListPrefix = "inventory:pricelist";
    private const string WarehousePrefix = "inventory:warehouse";
    private const string CategoryPrefix = "inventory:category";
    private const string LotBatchPrefix = "inventory:lotbatch";
    private const string SerialNumberPrefix = "inventory:serialnumber";
    private const string AnalyticsPrefix = "inventory:analytics";
    private const string DashboardPrefix = "inventory:dashboard";

    public InventoryCacheService(
        IMemoryCache cache,
        ILogger<InventoryCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    #region Product Cache

    public Task InvalidateProductCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(ProductPrefix, tenantId, productId.ToString());
        _cache.Remove(key);
        _logger.LogDebug("Invalidated product cache for product {ProductId} in tenant {TenantId}", productId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateAllProductsCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        // Pattern-based removal not supported in MemoryCache
        // In production, use a distributed cache with pattern support or maintain a key registry
        _logger.LogDebug("Invalidating all products cache for tenant {TenantId} (pattern-based removal limited)", tenantId);

        // Invalidate common product-related keys
        var listKey = GenerateKey(ProductPrefix, tenantId, "list");
        var allKey = GenerateKey(ProductPrefix, tenantId, "all");
        _cache.Remove(listKey);
        _cache.Remove(allKey);

        return Task.CompletedTask;
    }

    public Task InvalidateProductsByCategoryCacheAsync(
        Guid tenantId,
        int categoryId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(ProductPrefix, tenantId, $"category:{categoryId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated products by category cache for category {CategoryId} in tenant {TenantId}", categoryId, tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Stock Cache

    public Task InvalidateStockCacheAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(StockPrefix, tenantId, $"{productId}:{warehouseId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated stock cache for product {ProductId} in warehouse {WarehouseId}, tenant {TenantId}",
            productId, warehouseId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateWarehouseStockCacheAsync(
        Guid tenantId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(StockPrefix, tenantId, $"warehouse:{warehouseId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated all stock cache for warehouse {WarehouseId} in tenant {TenantId}", warehouseId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateProductStockCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(StockPrefix, tenantId, $"product:{productId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated all stock cache for product {ProductId} in tenant {TenantId}", productId, tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Price List Cache

    public Task InvalidatePriceListCacheAsync(
        Guid tenantId,
        int priceListId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(PriceListPrefix, tenantId, priceListId.ToString());
        _cache.Remove(key);
        _logger.LogDebug("Invalidated price list cache for price list {PriceListId} in tenant {TenantId}", priceListId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateAllPriceListsCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var listKey = GenerateKey(PriceListPrefix, tenantId, "list");
        var allKey = GenerateKey(PriceListPrefix, tenantId, "all");
        _cache.Remove(listKey);
        _cache.Remove(allKey);
        _logger.LogDebug("Invalidated all price lists cache for tenant {TenantId}", tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateProductPriceCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(PriceListPrefix, tenantId, $"product:{productId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated product price cache for product {ProductId} in tenant {TenantId}", productId, tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Warehouse Cache

    public Task InvalidateWarehouseCacheAsync(
        Guid tenantId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(WarehousePrefix, tenantId, warehouseId.ToString());
        _cache.Remove(key);
        _logger.LogDebug("Invalidated warehouse cache for warehouse {WarehouseId} in tenant {TenantId}", warehouseId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateAllWarehousesCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var listKey = GenerateKey(WarehousePrefix, tenantId, "list");
        var allKey = GenerateKey(WarehousePrefix, tenantId, "all");
        _cache.Remove(listKey);
        _cache.Remove(allKey);
        _logger.LogDebug("Invalidated all warehouses cache for tenant {TenantId}", tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Category Cache

    public Task InvalidateCategoryCacheAsync(
        Guid tenantId,
        int categoryId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(CategoryPrefix, tenantId, categoryId.ToString());
        _cache.Remove(key);
        _logger.LogDebug("Invalidated category cache for category {CategoryId} in tenant {TenantId}", categoryId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateAllCategoriesCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var listKey = GenerateKey(CategoryPrefix, tenantId, "list");
        var allKey = GenerateKey(CategoryPrefix, tenantId, "all");
        var treeKey = GenerateKey(CategoryPrefix, tenantId, "tree");
        _cache.Remove(listKey);
        _cache.Remove(allKey);
        _cache.Remove(treeKey);
        _logger.LogDebug("Invalidated all categories cache for tenant {TenantId}", tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Lot/Batch Cache

    public Task InvalidateLotBatchCacheAsync(
        Guid tenantId,
        int lotBatchId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(LotBatchPrefix, tenantId, lotBatchId.ToString());
        _cache.Remove(key);
        _logger.LogDebug("Invalidated lot/batch cache for lot {LotBatchId} in tenant {TenantId}", lotBatchId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateProductLotBatchCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(LotBatchPrefix, tenantId, $"product:{productId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated all lot/batch cache for product {ProductId} in tenant {TenantId}", productId, tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Serial Number Cache

    public Task InvalidateSerialNumberCacheAsync(
        Guid tenantId,
        int serialNumberId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(SerialNumberPrefix, tenantId, serialNumberId.ToString());
        _cache.Remove(key);
        _logger.LogDebug("Invalidated serial number cache for serial {SerialNumberId} in tenant {TenantId}", serialNumberId, tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateProductSerialNumbersCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(SerialNumberPrefix, tenantId, $"product:{productId}");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated all serial numbers cache for product {ProductId} in tenant {TenantId}", productId, tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Analytics Cache

    public Task InvalidateAnalyticsCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(AnalyticsPrefix, tenantId, "all");
        _cache.Remove(key);

        // Also invalidate dashboard cache
        var dashboardKey = GenerateKey(DashboardPrefix, tenantId, "all");
        _cache.Remove(dashboardKey);

        _logger.LogDebug("Invalidated analytics cache for tenant {TenantId}", tenantId);
        return Task.CompletedTask;
    }

    public Task InvalidateDashboardCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(DashboardPrefix, tenantId, "all");
        _cache.Remove(key);
        _logger.LogDebug("Invalidated dashboard cache for tenant {TenantId}", tenantId);
        return Task.CompletedTask;
    }

    #endregion

    #region Private Methods

    private static string GenerateKey(string prefix, Guid tenantId, string suffix)
    {
        return $"{prefix}:{tenantId}:{suffix}";
    }

    #endregion
}
