using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ProductVariant entity
/// </summary>
public class ProductVariantRepository : BaseRepository<ProductVariant>, IProductVariantRepository
{
    public ProductVariantRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<ProductVariant?> GetWithOptionsAsync(int variantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Options.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.ProductAttribute)
            .Include(v => v.Options.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.ProductAttributeOption)
            .Include(v => v.Stocks.Where(s => !s.IsDeleted))
            .Where(v => !v.IsDeleted && v.Id == variantId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductVariant>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Options.Where(o => !o.IsDeleted).OrderBy(o => o.DisplayOrder))
                .ThenInclude(o => o.ProductAttribute)
            .Include(v => v.Stocks.Where(s => !s.IsDeleted))
            .Where(v => !v.IsDeleted && v.ProductId == productId)
            .OrderBy(v => v.DisplayOrder)
            .ThenBy(v => v.VariantName)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductVariant?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => !v.IsDeleted && v.Sku == sku)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductVariant?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Product)
            .Include(v => v.Stocks.Where(s => !s.IsDeleted))
            .Where(v => !v.IsDeleted && v.Barcode == barcode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductVariant>> GetActiveVariantsAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Options.Where(o => !o.IsDeleted).OrderBy(o => o.DisplayOrder))
                .ThenInclude(o => o.ProductAttribute)
            .Include(v => v.Stocks.Where(s => !s.IsDeleted))
            .Where(v => !v.IsDeleted && v.IsActive && v.ProductId == productId)
            .OrderBy(v => v.DisplayOrder)
            .ThenBy(v => v.VariantName)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductVariant?> GetDefaultVariantAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(v => v.Options.Where(o => !o.IsDeleted))
            .Where(v => !v.IsDeleted && v.ProductId == productId && v.IsDefault)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithSkuAsync(string sku, int? excludeVariantId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(v => !v.IsDeleted && v.Sku == sku);

        if (excludeVariantId.HasValue)
        {
            query = query.Where(v => v.Id != excludeVariantId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithBarcodeAsync(string barcode, int? excludeVariantId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(barcode))
            return false;

        var query = DbSet.Where(v => !v.IsDeleted && v.Barcode == barcode);

        if (excludeVariantId.HasValue)
        {
            query = query.Where(v => v.Id != excludeVariantId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductVariantOption>> GetVariantOptionsAsync(int variantId, CancellationToken cancellationToken = default)
    {
        return await Context.ProductVariantOptions
            .Include(o => o.ProductAttribute)
            .Include(o => o.ProductAttributeOption)
            .Where(o => !o.IsDeleted && o.ProductVariantId == variantId)
            .OrderBy(o => o.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductVariantOption> AddVariantOptionAsync(ProductVariantOption option, CancellationToken cancellationToken = default)
    {
        await Context.ProductVariantOptions.AddAsync(option, cancellationToken);
        return option;
    }

    public void RemoveVariantOption(ProductVariantOption option)
    {
        Context.ProductVariantOptions.Remove(option);
    }
}
