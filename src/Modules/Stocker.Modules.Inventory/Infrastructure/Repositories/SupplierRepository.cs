using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Supplier entity
/// </summary>
public class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<Supplier?> GetWithProductsAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Products.Where(p => !p.IsDeleted))
            .Where(s => !s.IsDeleted && s.Id == supplierId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Supplier?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Supplier>> GetActiveSuppliersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Supplier>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var normalizedSearchTerm = searchTerm.ToLower().Trim();
        return await DbSet
            .Where(s => !s.IsDeleted &&
                (s.Name.ToLower().Contains(normalizedSearchTerm) ||
                 s.Code.ToLower().Contains(normalizedSearchTerm) ||
                 (s.Email != null && s.Email.Value.ToLower().Contains(normalizedSearchTerm))))
            .OrderBy(s => s.Name)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeSupplierId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(s => !s.IsDeleted && s.Code == code);

        if (excludeSupplierId.HasValue)
        {
            query = query.Where(s => s.Id != excludeSupplierId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    /// <summary>
    /// Purchase.Supplier ile eşleştirilmiş Inventory.Supplier'ı getirir
    /// </summary>
    public async Task<Supplier?> GetByPurchaseSupplierIdAsync(Guid purchaseSupplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.PurchaseSupplierId == purchaseSupplierId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// Purchase.Supplier ile eşleştirilmiş tüm Inventory.Supplier'ları getirir
    /// </summary>
    public async Task<IReadOnlyList<Supplier>> GetLinkedSuppliersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.PurchaseSupplierId != null)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Purchase.Supplier ile eşleştirilmemiş Inventory.Supplier'ları getirir
    /// </summary>
    public async Task<IReadOnlyList<Supplier>> GetUnlinkedSuppliersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => !s.IsDeleted && s.PurchaseSupplierId == null)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }
}
