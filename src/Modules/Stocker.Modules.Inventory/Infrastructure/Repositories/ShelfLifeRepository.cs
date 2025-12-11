using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ShelfLife entity
/// </summary>
public class ShelfLifeRepository : BaseRepository<ShelfLife>, IShelfLifeRepository
{
    public ShelfLifeRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<ShelfLife?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Where(s => !s.IsDeleted && s.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ShelfLife?> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Where(s => !s.IsDeleted && s.ProductId == productId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ShelfLife>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Where(s => !s.IsDeleted && s.IsActive)
            .OrderBy(s => s.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ShelfLife>> GetRequiringSpecialStorageAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Where(s => !s.IsDeleted && s.IsActive && s.RequiresSpecialStorage)
            .OrderBy(s => s.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ShelfLife>> GetByRequiredZoneTypeAsync(ZoneType zoneType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Product)
            .Where(s => !s.IsDeleted && s.IsActive && s.RequiredZoneType == zoneType)
            .OrderBy(s => s.Product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForProductAsync(int productId, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(s => !s.IsDeleted && s.ProductId == productId);

        if (excludeId.HasValue)
        {
            query = query.Where(s => s.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
