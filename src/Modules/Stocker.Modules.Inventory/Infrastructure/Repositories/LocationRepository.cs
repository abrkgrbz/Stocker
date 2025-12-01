using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Location entity
/// </summary>
public class LocationRepository : BaseRepository<Location>, ILocationRepository
{
    public LocationRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Location>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => !l.IsDeleted && l.WarehouseId == warehouseId)
            .OrderBy(l => l.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<Location?> GetByCodeAsync(int warehouseId, string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => !l.IsDeleted && l.WarehouseId == warehouseId && l.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Location>> GetActiveByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => !l.IsDeleted && l.IsActive && l.WarehouseId == warehouseId)
            .OrderBy(l => l.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(int warehouseId, string code, int? excludeLocationId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(l => !l.IsDeleted && l.WarehouseId == warehouseId && l.Code == code);

        if (excludeLocationId.HasValue)
        {
            query = query.Where(l => l.Id != excludeLocationId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
