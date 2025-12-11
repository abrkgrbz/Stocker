using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for InventoryAdjustment entity
/// </summary>
public class InventoryAdjustmentRepository : BaseRepository<InventoryAdjustment>, IInventoryAdjustmentRepository
{
    public InventoryAdjustmentRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<InventoryAdjustment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Include(a => a.Location)
            .Include(a => a.StockCount)
            .Include(a => a.Items)
                .ThenInclude(i => i.Product)
            .Where(a => !a.IsDeleted && a.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<InventoryAdjustment?> GetByNumberAsync(string adjustmentNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Where(a => !a.IsDeleted && a.AdjustmentNumber == adjustmentNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Location)
            .Where(a => !a.IsDeleted && a.WarehouseId == warehouseId)
            .OrderByDescending(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetByStatusAsync(AdjustmentStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Where(a => !a.IsDeleted && a.Status == status)
            .OrderByDescending(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetByTypeAsync(AdjustmentType adjustmentType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Where(a => !a.IsDeleted && a.AdjustmentType == adjustmentType)
            .OrderByDescending(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetByReasonAsync(AdjustmentReason reason, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Where(a => !a.IsDeleted && a.Reason == reason)
            .OrderByDescending(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetPendingApprovalAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Include(a => a.Items)
            .Where(a => !a.IsDeleted && a.Status == AdjustmentStatus.PendingApproval)
            .OrderBy(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Where(a => !a.IsDeleted &&
                a.AdjustmentDate >= startDate && a.AdjustmentDate <= endDate)
            .OrderByDescending(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetByStockCountAsync(int stockCountId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Include(a => a.Items)
            .Where(a => !a.IsDeleted && a.StockCountId == stockCountId)
            .OrderByDescending(a => a.AdjustmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryAdjustment>> GetDraftsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Warehouse)
            .Where(a => !a.IsDeleted && a.Status == AdjustmentStatus.Draft)
            .OrderByDescending(a => a.CreatedDate)
            .ToListAsync(cancellationToken);
    }
}
