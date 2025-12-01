using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Brand entity
/// </summary>
public class BrandRepository : BaseRepository<Brand>, IBrandRepository
{
    public BrandRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<Brand?> GetWithProductsAsync(int brandId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Products.Where(p => !p.IsDeleted))
            .Where(b => !b.IsDeleted && b.Id == brandId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Brand?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => !b.IsDeleted && b.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Brand?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => !b.IsDeleted && b.Name == name)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Brand>> GetActiveBrandsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => !b.IsDeleted && b.IsActive)
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasProductsAsync(int brandId, CancellationToken cancellationToken = default)
    {
        return await Context.Products
            .AnyAsync(p => !p.IsDeleted && p.BrandId == brandId, cancellationToken);
    }

    public async Task<bool> ExistsWithNameAsync(string name, int? excludeBrandId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(b => !b.IsDeleted && b.Name == name);

        if (excludeBrandId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBrandId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeBrandId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(b => !b.IsDeleted && b.Code == code);

        if (excludeBrandId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBrandId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Brand>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var normalizedSearchTerm = searchTerm.ToLower().Trim();
        return await DbSet
            .Where(b => !b.IsDeleted &&
                (b.Name.ToLower().Contains(normalizedSearchTerm) ||
                 b.Code.ToLower().Contains(normalizedSearchTerm)))
            .OrderBy(b => b.Name)
            .Take(50)
            .ToListAsync(cancellationToken);
    }
}
