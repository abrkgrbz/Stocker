using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Category entity
/// </summary>
public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
{
    public CategoryRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<Category?> GetWithSubCategoriesAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.SubCategories.Where(sc => !sc.IsDeleted))
            .Where(c => !c.IsDeleted && c.Id == categoryId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Category?> GetWithProductsAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Products.Where(p => !p.IsDeleted))
            .Where(c => !c.IsDeleted && c.Id == categoryId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetRootCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && c.ParentCategoryId == null)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetSubCategoriesAsync(int parentCategoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && c.ParentCategoryId == parentCategoryId)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && c.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetCategoryTreeAsync(CancellationToken cancellationToken = default)
    {
        // Get all active categories with their subcategories loaded
        return await DbSet
            .Include(c => c.SubCategories.Where(sc => !sc.IsDeleted))
            .Where(c => !c.IsDeleted && c.ParentCategoryId == null)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasProductsAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await Context.Products
            .AnyAsync(p => !p.IsDeleted && p.CategoryId == categoryId, cancellationToken);
    }

    public async Task<bool> HasSubcategoriesAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(c => !c.IsDeleted && c.ParentCategoryId == categoryId, cancellationToken);
    }

    public async Task<bool> ExistsWithNameAsync(string name, int? parentCategoryId = null, int? excludeCategoryId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(c => !c.IsDeleted && c.Name == name);

        if (parentCategoryId.HasValue)
        {
            query = query.Where(c => c.ParentCategoryId == parentCategoryId.Value);
        }
        else
        {
            query = query.Where(c => c.ParentCategoryId == null);
        }

        if (excludeCategoryId.HasValue)
        {
            query = query.Where(c => c.Id != excludeCategoryId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeCategoryId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(c => !c.IsDeleted && c.Code == code);

        if (excludeCategoryId.HasValue)
        {
            query = query.Where(c => c.Id != excludeCategoryId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
