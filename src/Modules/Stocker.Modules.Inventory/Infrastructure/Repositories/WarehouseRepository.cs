using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Warehouse entity
/// </summary>
public class WarehouseRepository : BaseRepository<Warehouse>, IWarehouseRepository
{
    public WarehouseRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<Warehouse?> GetWithLocationsAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(w => w.Locations.Where(l => !l.IsDeleted))
            .Where(w => !w.IsDeleted && w.Id == warehouseId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Warehouse?> GetWithStocksAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(w => w.Stocks.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Product)
            .Where(w => !w.IsDeleted && w.Id == warehouseId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Warehouse?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Warehouse?> GetDefaultWarehouseAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.IsDefault && w.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Warehouse>> GetActiveWarehousesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.IsActive)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Warehouse>> GetByBranchAsync(int? branchId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(w => !w.IsDeleted && w.BranchId == branchId)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeWarehouseId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(w => !w.IsDeleted && w.Code == code);

        if (excludeWarehouseId.HasValue)
        {
            query = query.Where(w => w.Id != excludeWarehouseId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
