using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ProductBundle entity
/// </summary>
public class ProductBundleRepository : BaseRepository<ProductBundle>, IProductBundleRepository
{
    public ProductBundleRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<ProductBundle?> GetWithItemsAsync(int bundleId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Items.Where(i => !i.IsDeleted).OrderBy(i => i.DisplayOrder))
                .ThenInclude(i => i.Product)
            .Where(b => !b.IsDeleted && b.Id == bundleId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductBundle?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => !b.IsDeleted && b.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductBundle>> GetActiveBundlesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Items.Where(i => !i.IsDeleted).OrderBy(i => i.DisplayOrder))
            .Where(b => !b.IsDeleted && b.IsActive)
            .OrderBy(b => b.DisplayOrder)
            .ThenBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductBundle>> GetValidBundlesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Include(b => b.Items.Where(i => !i.IsDeleted).OrderBy(i => i.DisplayOrder))
            .Where(b => !b.IsDeleted && b.IsActive &&
                (!b.ValidFrom.HasValue || b.ValidFrom <= now) &&
                (!b.ValidTo.HasValue || b.ValidTo >= now))
            .OrderBy(b => b.DisplayOrder)
            .ThenBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductBundle>> GetByTypeAsync(BundleType bundleType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Items.Where(i => !i.IsDeleted).OrderBy(i => i.DisplayOrder))
            .Where(b => !b.IsDeleted && b.BundleType == bundleType)
            .OrderBy(b => b.DisplayOrder)
            .ThenBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeBundleId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(b => !b.IsDeleted && b.Code == code);

        if (excludeBundleId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBundleId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductBundle>> GetBundlesContainingProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Items.Where(i => !i.IsDeleted))
            .Where(b => !b.IsDeleted && b.Items.Any(i => !i.IsDeleted && i.ProductId == productId))
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductBundleItem?> GetItemByIdAsync(int itemId, CancellationToken cancellationToken = default)
    {
        return await Context.ProductBundleItems
            .Include(i => i.Product)
            .Where(i => !i.IsDeleted && i.Id == itemId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductBundleItem> AddItemAsync(ProductBundleItem item, CancellationToken cancellationToken = default)
    {
        await Context.ProductBundleItems.AddAsync(item, cancellationToken);
        return item;
    }

    public void UpdateItem(ProductBundleItem item)
    {
        Context.ProductBundleItems.Update(item);
    }

    public void RemoveItem(ProductBundleItem item)
    {
        item.SetRequired(false);
        Context.ProductBundleItems.Remove(item);
    }
}
