using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Stock entity
/// </summary>
public class StockRepository : BaseRepository<Stock>, IStockRepository
{
    public StockRepository(InventoryDbContext context) : base(context)
    {
    }

    public override async Task<IReadOnlyList<Stock>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Include(s => s.Location)
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Stock?> GetByProductAndWarehouseAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.ProductId == productId && s.WarehouseId == warehouseId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Stock?> GetByProductAndLocationAsync(int productId, int warehouseId, int? locationId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Include(s => s.Location)
            .Where(s => !s.IsDeleted &&
                   s.ProductId == productId &&
                   s.WarehouseId == warehouseId &&
                   (locationId == null ? s.LocationId == null : s.LocationId == locationId))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Warehouse)
            .Include(s => s.Location)
            .Where(s => !s.IsDeleted && s.ProductId == productId)
            .OrderBy(s => s.Warehouse.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Location)
            .Where(s => !s.IsDeleted && s.WarehouseId == warehouseId)
            .OrderBy(s => s.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetByLocationAsync(int locationId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.LocationId == locationId)
            .OrderBy(s => s.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalQuantityByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.ProductId == productId)
            .SumAsync(s => s.Quantity, cancellationToken);
    }

    public async Task<decimal> GetTotalAvailableQuantityAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        var totalStock = await DbSet
            .Where(s => !s.IsDeleted && s.ProductId == productId && s.WarehouseId == warehouseId)
            .SumAsync(s => s.Quantity, cancellationToken);

        var reservedQuantity = await Context.StockReservations
            .Where(r => !r.IsDeleted &&
                   r.ProductId == productId &&
                   r.WarehouseId == warehouseId &&
                   r.Status == Domain.Enums.ReservationStatus.Active)
            .SumAsync(r => r.Quantity - r.FulfilledQuantity, cancellationToken);

        return totalStock - reservedQuantity;
    }

    public async Task<IReadOnlyList<Stock>> GetLowStockItemsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.Product.IsActive && s.Product.IsStockTracked)
            .Where(s => s.Quantity <= s.Product.ReorderPoint)
            .OrderBy(s => s.Quantity)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetNegativeStocksAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.Quantity < 0)
            .OrderBy(s => s.Quantity)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetExpiringStocksAsync(int withinDays, CancellationToken cancellationToken = default)
    {
        var expiryDate = DateTime.UtcNow.AddDays(withinDays);
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Include(s => s.Location)
            .Where(s => !s.IsDeleted && s.ExpiryDate.HasValue && s.ExpiryDate.Value <= expiryDate)
            .OrderBy(s => s.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Stock>> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.LotNumber == lotNumber)
            .OrderBy(s => s.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Stock?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => !s.IsDeleted && s.SerialNumber == serialNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> HasStockAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.ProductId == productId && s.Quantity > 0)
            .AnyAsync(cancellationToken);
    }
}
