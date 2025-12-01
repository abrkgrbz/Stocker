using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for StockCount entity
/// </summary>
public class StockCountRepository : BaseRepository<StockCount>, IStockCountRepository
{
    public StockCountRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<StockCount?> GetWithItemsAsync(int countId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Items.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.Product)
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Id == countId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<StockCount?> GetByCountNumberAsync(string countNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.CountNumber == countNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockCount>> GetByStatusAsync(StockCountStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == status)
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockCount>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && c.WarehouseId == warehouseId)
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockCount>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.CountDate >= startDate && c.CountDate <= endDate)
            .OrderByDescending(c => c.CountDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockCount>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == StockCountStatus.Completed)
            .OrderBy(c => c.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockCount>> GetCountsWithDiscrepanciesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Include(c => c.Items.Where(i => !i.IsDeleted && i.HasDifference))
                .ThenInclude(i => i.Product)
            .Where(c => !c.IsDeleted && c.Items.Any(i => !i.IsDeleted && i.HasDifference))
            .OrderByDescending(c => c.CountDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateCountNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"CNT-{today:yyyyMMdd}-";

        var lastCount = await DbSet
            .Where(c => c.CountNumber.StartsWith(prefix))
            .OrderByDescending(c => c.CountNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastCount == null)
        {
            return $"{prefix}0001";
        }

        var lastNumberStr = lastCount.CountNumber.Substring(prefix.Length);
        if (int.TryParse(lastNumberStr, out var lastNumber))
        {
            return $"{prefix}{(lastNumber + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
