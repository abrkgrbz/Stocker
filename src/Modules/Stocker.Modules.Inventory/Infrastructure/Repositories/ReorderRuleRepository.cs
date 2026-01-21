using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ReorderRule entity
/// </summary>
public class ReorderRuleRepository : BaseRepository<ReorderRule>, IReorderRuleRepository
{
    public ReorderRuleRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<ReorderRule?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.Status == ReorderRuleStatus.Active)
            .OrderBy(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetByStatusAsync(ReorderRuleStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.Status == status)
            .OrderBy(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.ProductId == productId)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.CategoryId == categoryId)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.WarehouseId == warehouseId)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted && r.SupplierId == supplierId)
            .OrderBy(r => r.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ReorderRule>> GetScheduledDueAsync(DateTime beforeTime, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Product)
            .Include(r => r.Category)
            .Include(r => r.Warehouse)
            .Include(r => r.Supplier)
            .Where(r => !r.IsDeleted
                && r.Status == ReorderRuleStatus.Active
                && r.IsScheduled
                && r.NextScheduledRun.HasValue
                && r.NextScheduledRun.Value <= beforeTime)
            .OrderBy(r => r.NextScheduledRun)
            .ToListAsync(cancellationToken);
    }
}
