using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Product entity
/// </summary>
public class ProductRepository : BaseRepository<Product>, IProductRepository
{
    public ProductRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<Product?> GetWithDetailsAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Supplier)
            .Include(p => p.Images.Where(i => !i.IsDeleted))
            .Include(p => p.Stocks.Where(s => !s.IsDeleted))
            .Include(p => p.Variants.Where(v => !v.IsDeleted))
                .ThenInclude(v => v.Options.Where(o => !o.IsDeleted))
            .Include(p => p.AttributeValues.Where(av => !av.IsDeleted))
            .Where(p => !p.IsDeleted && p.Id == productId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Product?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Product?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.Barcode == barcode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.SKU == sku)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Brand)
            .Where(p => !p.IsDeleted && p.CategoryId == categoryId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetByBrandAsync(int brandId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Category)
            .Where(p => !p.IsDeleted && p.BrandId == brandId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => !p.IsDeleted && p.SupplierId == supplierId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetActiveProductsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => !p.IsDeleted && p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetLowStockProductsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Category)
            .Include(p => p.Stocks.Where(s => !s.IsDeleted))
            .Where(p => !p.IsDeleted && p.IsActive && p.IsStockTracked)
            .Where(p => p.Stocks.Sum(s => s.Quantity) <= p.ReorderPoint)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var normalizedSearchTerm = searchTerm.ToLower().Trim();
        return await DbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => !p.IsDeleted &&
                (p.Name.ToLower().Contains(normalizedSearchTerm) ||
                 p.Code.ToLower().Contains(normalizedSearchTerm) ||
                 (p.Barcode != null && p.Barcode.ToLower().Contains(normalizedSearchTerm))))
            .OrderBy(p => p.Name)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeProductId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(p => !p.IsDeleted && p.Code == code);

        if (excludeProductId.HasValue)
        {
            query = query.Where(p => p.Id != excludeProductId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithBarcodeAsync(string barcode, int? excludeProductId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(p => !p.IsDeleted && p.Barcode == barcode);

        if (excludeProductId.HasValue)
        {
            query = query.Where(p => p.Id != excludeProductId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<int> GetCountByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(p => !p.IsDeleted && p.CategoryId == categoryId)
            .CountAsync(cancellationToken);
    }
}
