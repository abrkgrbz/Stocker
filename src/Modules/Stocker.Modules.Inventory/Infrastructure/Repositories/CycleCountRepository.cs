using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for CycleCount entity
/// </summary>
public class CycleCountRepository : BaseRepository<CycleCount>, ICycleCountRepository
{
    public CycleCountRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<CycleCount?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Include(c => c.Zone)
            .Include(c => c.Category)
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .Include(c => c.Items)
                .ThenInclude(i => i.Location)
            .Where(c => !c.IsDeleted && c.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CycleCount?> GetByPlanNumberAsync(string planNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.PlanNumber == planNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Zone)
            .Where(c => !c.IsDeleted && c.WarehouseId == warehouseId)
            .OrderByDescending(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetByStatusAsync(CycleCountStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == status)
            .OrderByDescending(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetByTypeAsync(CycleCountType countType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.CountType == countType)
            .OrderByDescending(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetPlannedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == CycleCountStatus.Planned)
            .OrderBy(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetInProgressAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == CycleCountStatus.InProgress)
            .OrderBy(c => c.ActualStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetByScheduledDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted &&
                c.ScheduledStartDate >= startDate && c.ScheduledStartDate <= endDate)
            .OrderBy(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetByAssignedUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.AssignedUserId == userId)
            .OrderByDescending(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CycleCount>> GetUpcomingAsync(int daysAhead, CancellationToken cancellationToken = default)
    {
        var targetDate = DateTime.UtcNow.AddDays(daysAhead);
        return await DbSet
            .Include(c => c.Warehouse)
            .Where(c => !c.IsDeleted && c.Status == CycleCountStatus.Planned &&
                c.ScheduledStartDate <= targetDate && c.ScheduledStartDate >= DateTime.UtcNow)
            .OrderBy(c => c.ScheduledStartDate)
            .ToListAsync(cancellationToken);
    }
}
