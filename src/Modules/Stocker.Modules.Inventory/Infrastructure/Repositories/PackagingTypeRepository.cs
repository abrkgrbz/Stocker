using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for PackagingType entity
/// </summary>
public class PackagingTypeRepository : BaseRepository<PackagingType>, IPackagingTypeRepository
{
    public PackagingTypeRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<PackagingType?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PackagingType?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PackagingType>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PackagingType>> GetByCategoryAsync(PackagingCategory category, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.Category == category)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(p => !p.IsDeleted && p.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PackagingType>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var normalizedSearchTerm = searchTerm.ToLower().Trim();
        return await DbSet
            .Where(p => !p.IsDeleted &&
                (p.Name.ToLower().Contains(normalizedSearchTerm) ||
                 p.Code.ToLower().Contains(normalizedSearchTerm)))
            .OrderBy(p => p.Name)
            .Take(50)
            .ToListAsync(cancellationToken);
    }
}
