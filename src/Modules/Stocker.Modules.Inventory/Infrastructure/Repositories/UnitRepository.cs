using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Unit entity
/// </summary>
public class UnitRepository : BaseRepository<Unit>, IUnitRepository
{
    public UnitRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<Unit?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => !u.IsDeleted && u.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Unit>> GetBaseUnitsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => !u.IsDeleted && u.BaseUnitId == null)
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Unit>> GetDerivedUnitsAsync(int baseUnitId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.BaseUnit)
            .Where(u => !u.IsDeleted && u.BaseUnitId == baseUnitId)
            .OrderBy(u => u.ConversionFactor)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Unit>> GetActiveUnitsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.BaseUnit)
            .Where(u => !u.IsDeleted && u.IsActive)
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeUnitId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u => !u.IsDeleted && u.Code == code);

        if (excludeUnitId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUnitId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
