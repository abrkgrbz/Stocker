using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Services;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Stok seviye kontrol servisi implementasyonu.
/// </summary>
public class StockLevelService : IStockLevelService
{
    private readonly InventoryDbContext _dbContext;

    public StockLevelService(InventoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<StockLevelAlert>> CheckMinimumStockLevelsAsync(
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var query = from s in _dbContext.Stocks.AsNoTracking()
                    join p in _dbContext.Products.AsNoTracking() on s.ProductId equals p.Id
                    join w in _dbContext.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                    where p.IsStockTracked
                          && p.MinimumStock > 0
                          && s.Quantity < p.MinimumStock
                          && (!warehouseId.HasValue || s.WarehouseId == warehouseId)
                    select new StockLevelAlert(
                        p.Id,
                        p.Code,
                        p.Name,
                        w.Id,
                        w.Name,
                        s.Quantity,
                        p.MinimumStock,
                        p.MinimumStock - s.Quantity);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderAlert>> CheckReorderPointsAsync(
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var query = from s in _dbContext.Stocks.AsNoTracking()
                    join p in _dbContext.Products.AsNoTracking() on s.ProductId equals p.Id
                    join w in _dbContext.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                    where p.IsStockTracked
                          && p.ReorderPoint > 0
                          && s.Quantity <= p.ReorderPoint
                          && (!warehouseId.HasValue || s.WarehouseId == warehouseId)
                    select new ReorderAlert(
                        p.Id,
                        p.Code,
                        p.Name,
                        w.Id,
                        w.Name,
                        s.Quantity,
                        p.ReorderPoint,
                        p.ReorderQuantity,
                        p.SupplierId,
                        p.Supplier != null ? p.Supplier.Name : null);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ExpiryAlert>> CheckExpiringStocksAsync(
        int daysThreshold,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var thresholdDate = DateTime.UtcNow.AddDays(daysThreshold);

        var query = from s in _dbContext.Stocks.AsNoTracking()
                    join p in _dbContext.Products.AsNoTracking() on s.ProductId equals p.Id
                    join w in _dbContext.Warehouses.AsNoTracking() on s.WarehouseId equals w.Id
                    where s.ExpiryDate.HasValue
                          && s.ExpiryDate.Value <= thresholdDate
                          && s.Quantity > 0
                          && (!warehouseId.HasValue || s.WarehouseId == warehouseId)
                    select new
                    {
                        StockId = s.Id,
                        ProductId = p.Id,
                        ProductCode = p.Code,
                        ProductName = p.Name,
                        WarehouseId = w.Id,
                        WarehouseName = w.Name,
                        s.LotNumber,
                        s.Quantity,
                        ExpiryDate = s.ExpiryDate!.Value
                    };

        var results = await query.ToListAsync(cancellationToken);

        return results.Select(r => new ExpiryAlert(
            r.StockId,
            r.ProductId,
            r.ProductCode,
            r.ProductName,
            r.WarehouseId,
            r.WarehouseName,
            r.LotNumber,
            r.Quantity,
            r.ExpiryDate,
            (int)(r.ExpiryDate - DateTime.UtcNow).TotalDays
        )).ToList();
    }

    public async Task CheckProductStockLevelAsync(
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null || !product.IsStockTracked)
            return;

        var stock = await _dbContext.Stocks
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId, cancellationToken);

        var currentQuantity = stock?.Quantity ?? 0;

        // Minimum stok kontrolü
        if (product.MinimumStock > 0 && currentQuantity < product.MinimumStock)
        {
            // Domain event fırlatılabilir veya bildirim gönderilebilir
            // Bu noktada loglama yapılır, gerekirse event fırlatılır
        }

        // Yeniden sipariş noktası kontrolü
        if (product.ReorderPoint > 0 && currentQuantity <= product.ReorderPoint)
        {
            // Domain event fırlatılabilir veya yeniden sipariş önerisi oluşturulabilir
        }
    }

    public async Task<decimal> CalculateWarehouseStockValueAsync(
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        var stockValue = await _dbContext.Stocks
            .AsNoTracking()
            .Where(s => s.WarehouseId == warehouseId && s.Quantity > 0)
            .Join(_dbContext.Products.AsNoTracking(),
                s => s.ProductId,
                p => p.Id,
                (s, p) => s.Quantity * (p.CostPrice != null ? p.CostPrice.Amount : 0m))
            .SumAsync(cancellationToken);

        return stockValue;
    }

    public async Task<decimal> GetProductTotalStockAsync(
        int productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Stocks
            .AsNoTracking()
            .Where(s => s.ProductId == productId);

        if (warehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == warehouseId.Value);

        return await query.SumAsync(s => s.Quantity, cancellationToken);
    }
}
