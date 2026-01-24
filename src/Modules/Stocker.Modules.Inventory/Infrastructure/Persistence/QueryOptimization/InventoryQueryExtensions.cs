using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.QueryOptimization;

/// <summary>
/// Optimized query extensions for inventory operations.
/// Provides pre-configured IQueryable with split queries, no-tracking, and selective includes.
/// </summary>
public static class InventoryQueryExtensions
{
    /// <summary>
    /// Optimized product query with selective eager loading.
    /// Uses AsSplitQuery to avoid cartesian explosion with multiple collections.
    /// </summary>
    public static IQueryable<Product> OptimizedProducts(this DbSet<Product> products, bool includeStock = false, bool includeCategory = true)
    {
        var query = products.AsNoTracking().AsSplitQuery();

        if (includeCategory)
            query = query.Include(p => p.Category);

        if (includeStock)
            query = query.Include(p => p.Stocks);

        return query;
    }

    /// <summary>
    /// Optimized stock query filtered by tenant and warehouse.
    /// </summary>
    public static IQueryable<Stock> OptimizedStocks(this DbSet<Stock> stocks, Guid tenantId, int? warehouseId = null)
    {
        var query = stocks.AsNoTracking()
            .Where(s => s.TenantId == tenantId);

        if (warehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == warehouseId.Value);

        return query.Include(s => s.Product)
                    .Include(s => s.Warehouse);
    }

    /// <summary>
    /// Optimized stock movement query with date range filtering.
    /// Leverages the TenantId + CreatedAt index.
    /// </summary>
    public static IQueryable<StockMovement> OptimizedMovements(
        this DbSet<StockMovement> movements,
        Guid tenantId,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = movements.AsNoTracking()
            .Where(m => m.TenantId == tenantId);

        if (fromDate.HasValue)
            query = query.Where(m => m.MovementDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(m => m.MovementDate <= toDate.Value);

        return query.OrderByDescending(m => m.MovementDate);
    }

    /// <summary>
    /// Optimized transfer query with includes for list display.
    /// </summary>
    public static IQueryable<StockTransfer> OptimizedTransfers(
        this DbSet<StockTransfer> transfers,
        Guid tenantId)
    {
        return transfers.AsNoTracking()
            .AsSplitQuery()
            .Where(t => t.TenantId == tenantId)
            .Include(t => t.SourceWarehouse)
            .Include(t => t.DestinationWarehouse)
            .Include(t => t.Items)
            .OrderByDescending(t => t.TransferDate);
    }

    /// <summary>
    /// Paginated query helper with consistent ordering.
    /// </summary>
    public static IQueryable<T> Paginate<T>(this IQueryable<T> query, int page, int pageSize) where T : class
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 500) pageSize = 500;

        return query.Skip((page - 1) * pageSize).Take(pageSize);
    }

    /// <summary>
    /// Efficient count query that avoids loading entities.
    /// </summary>
    public static async Task<(List<T> Items, int TotalCount)> ToPagedListAsync<T>(
        this IQueryable<T> query,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default) where T : class
    {
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Paginate(page, pageSize).ToListAsync(cancellationToken);
        return (items, totalCount);
    }
}

/// <summary>
/// Index recommendations for inventory module.
/// These should be created via EF Core migration.
/// </summary>
public static class InventoryIndexRecommendations
{
    /// <summary>
    /// Recommended indexes for optimal query performance.
    /// Apply these in a migration file.
    /// </summary>
    public static readonly string[] RecommendedIndexes = new[]
    {
        // Stock queries - most common lookup pattern
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_Stocks_TenantId_ProductId_WarehouseId ON \"Stocks\" (\"TenantId\", \"ProductId\", \"WarehouseId\") INCLUDE (\"Quantity\", \"ReservedQuantity\")",

        // Stock movement date range queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_StockMovements_TenantId_CreatedAt ON \"StockMovements\" (\"TenantId\", \"CreatedAt\" DESC) INCLUDE (\"ProductId\", \"WarehouseId\", \"MovementType\", \"Quantity\")",

        // Product search by code/name
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_Products_TenantId_Code ON \"Products\" (\"TenantId\", \"Code\")",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_Products_TenantId_Name ON \"Products\" (\"TenantId\", \"Name\")",

        // Transfer status queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_StockTransfers_TenantId_Status ON \"StockTransfers\" (\"TenantId\", \"Status\") INCLUDE (\"CreatedAt\")",

        // Reservation expiry queries (for cleanup service)
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_StockReservations_ExpiresAt ON \"StockReservations\" (\"ExpiresAt\") WHERE \"Status\" = 'Active'",

        // Lot/Batch expiry queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS IX_LotBatches_TenantId_ExpiryDate ON \"LotBatches\" (\"TenantId\", \"ExpiryDate\") WHERE \"ExpiryDate\" IS NOT NULL"
    };
}
