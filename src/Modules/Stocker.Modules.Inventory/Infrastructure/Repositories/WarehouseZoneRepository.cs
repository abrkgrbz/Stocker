using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for WarehouseZone entity
/// </summary>
public class WarehouseZoneRepository : BaseRepository<WarehouseZone>, IWarehouseZoneRepository
{
    public WarehouseZoneRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<WarehouseZone?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(z => z.Warehouse)
            .Include(z => z.Locations.Where(l => !l.IsDeleted))
            .Where(z => !z.IsDeleted && z.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(z => z.Locations.Where(l => !l.IsDeleted))
            .Where(z => !z.IsDeleted && z.WarehouseId == warehouseId)
            .OrderBy(z => z.Priority)
            .ThenBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(z => z.Warehouse)
            .Where(z => !z.IsDeleted && z.IsActive)
            .OrderBy(z => z.Warehouse.Name)
            .ThenBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<WarehouseZone?> GetByWarehouseAndCodeAsync(int warehouseId, string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(z => z.Warehouse)
            .Where(z => !z.IsDeleted && z.WarehouseId == warehouseId && z.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<WarehouseZone?> GetByCodeAsync(int warehouseId, string code, CancellationToken cancellationToken = default)
    {
        return await GetByWarehouseAndCodeAsync(warehouseId, code, cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetActiveByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(z => !z.IsDeleted && z.IsActive && z.WarehouseId == warehouseId)
            .OrderBy(z => z.Priority)
            .ThenBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetByZoneTypeAsync(ZoneType zoneType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(z => z.Warehouse)
            .Where(z => !z.IsDeleted && z.ZoneType == zoneType)
            .OrderBy(z => z.Warehouse.Name)
            .ThenBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetTemperatureControlledAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(z => !z.IsDeleted && z.WarehouseId == warehouseId && z.IsTemperatureControlled)
            .OrderBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetHazardousAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(z => !z.IsDeleted && z.WarehouseId == warehouseId && z.IsHazardous)
            .OrderBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WarehouseZone>> GetQuarantineZonesAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(z => !z.IsDeleted && z.WarehouseId == warehouseId && z.IsQuarantineZone)
            .OrderBy(z => z.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(int warehouseId, string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(z => !z.IsDeleted && z.WarehouseId == warehouseId && z.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(z => z.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
