namespace Stocker.Modules.Inventory.Application.Contracts;

/// <summary>
/// Service for inventory-specific cache operations.
/// </summary>
public interface IInventoryCacheService
{
    #region Product Cache

    /// <summary>
    /// Invalidates product cache.
    /// </summary>
    Task InvalidateProductCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all products cache for a tenant.
    /// </summary>
    Task InvalidateAllProductsCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates products by category cache.
    /// </summary>
    Task InvalidateProductsByCategoryCacheAsync(
        Guid tenantId,
        int categoryId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Stock Cache

    /// <summary>
    /// Invalidates stock cache for a product in a warehouse.
    /// </summary>
    Task InvalidateStockCacheAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all stock cache for a warehouse.
    /// </summary>
    Task InvalidateWarehouseStockCacheAsync(
        Guid tenantId,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all stock cache for a product across all warehouses.
    /// </summary>
    Task InvalidateProductStockCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Price List Cache

    /// <summary>
    /// Invalidates price list cache.
    /// </summary>
    Task InvalidatePriceListCacheAsync(
        Guid tenantId,
        int priceListId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all price lists cache for a tenant.
    /// </summary>
    Task InvalidateAllPriceListsCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates price cache for a specific product.
    /// </summary>
    Task InvalidateProductPriceCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Warehouse Cache

    /// <summary>
    /// Invalidates warehouse cache.
    /// </summary>
    Task InvalidateWarehouseCacheAsync(
        Guid tenantId,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all warehouses cache for a tenant.
    /// </summary>
    Task InvalidateAllWarehousesCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Category Cache

    /// <summary>
    /// Invalidates category cache.
    /// </summary>
    Task InvalidateCategoryCacheAsync(
        Guid tenantId,
        int categoryId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all categories cache for a tenant.
    /// </summary>
    Task InvalidateAllCategoriesCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Lot/Batch Cache

    /// <summary>
    /// Invalidates lot/batch cache.
    /// </summary>
    Task InvalidateLotBatchCacheAsync(
        Guid tenantId,
        int lotBatchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all lot/batch cache for a product.
    /// </summary>
    Task InvalidateProductLotBatchCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Serial Number Cache

    /// <summary>
    /// Invalidates serial number cache.
    /// </summary>
    Task InvalidateSerialNumberCacheAsync(
        Guid tenantId,
        int serialNumberId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates all serial numbers cache for a product.
    /// </summary>
    Task InvalidateProductSerialNumbersCacheAsync(
        Guid tenantId,
        int productId,
        CancellationToken cancellationToken = default);

    #endregion

    #region Analytics Cache

    /// <summary>
    /// Invalidates inventory analytics cache.
    /// </summary>
    Task InvalidateAnalyticsCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates inventory dashboard cache.
    /// </summary>
    Task InvalidateDashboardCacheAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    #endregion
}
