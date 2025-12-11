using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for BarcodeDefinition entity
/// </summary>
public class BarcodeDefinitionRepository : BaseRepository<BarcodeDefinition>, IBarcodeDefinitionRepository
{
    public BarcodeDefinitionRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<BarcodeDefinition?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Product)
            .Include(b => b.ProductVariant)
            .Include(b => b.Unit)
            .Include(b => b.PackagingType)
            .Where(b => !b.IsDeleted && b.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<BarcodeDefinition?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Product)
            .Include(b => b.ProductVariant)
            .Where(b => !b.IsDeleted && b.Barcode == barcode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BarcodeDefinition>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Unit)
            .Include(b => b.PackagingType)
            .Where(b => !b.IsDeleted && b.ProductId == productId)
            .OrderByDescending(b => b.IsPrimary)
            .ThenBy(b => b.Barcode)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BarcodeDefinition>> GetByProductVariantAsync(int productVariantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Unit)
            .Include(b => b.PackagingType)
            .Where(b => !b.IsDeleted && b.ProductVariantId == productVariantId)
            .OrderByDescending(b => b.IsPrimary)
            .ThenBy(b => b.Barcode)
            .ToListAsync(cancellationToken);
    }

    public async Task<BarcodeDefinition?> GetPrimaryBarcodeAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => !b.IsDeleted && b.ProductId == productId && b.IsPrimary)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BarcodeDefinition>> GetActiveBarcodesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Product)
            .Where(b => !b.IsDeleted && b.IsActive)
            .OrderBy(b => b.Barcode)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithBarcodeAsync(string barcode, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(b => !b.IsDeleted && b.Barcode == barcode);

        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BarcodeDefinition>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var normalizedSearchTerm = searchTerm.ToLower().Trim();
        return await DbSet
            .Include(b => b.Product)
            .Where(b => !b.IsDeleted &&
                (b.Barcode.ToLower().Contains(normalizedSearchTerm) ||
                 (b.Gtin != null && b.Gtin.ToLower().Contains(normalizedSearchTerm))))
            .OrderBy(b => b.Barcode)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BarcodeDefinition>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveBarcodesAsync(cancellationToken);
    }

    public async Task<BarcodeDefinition?> GetByBarcodeValueAsync(string barcodeValue, CancellationToken cancellationToken = default)
    {
        return await GetByBarcodeAsync(barcodeValue, cancellationToken);
    }
}
