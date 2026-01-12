using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class MrpPlanRepository : IMrpPlanRepository
{
    private readonly ManufacturingDbContext _context;

    public MrpPlanRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<MrpPlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<MrpPlan?> GetByPlanNumberAsync(Guid tenantId, string planNumber, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.PlanNumber == planNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<MrpPlan>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MrpPlan>> GetByStatusAsync(Guid tenantId, MrpPlanStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Where(x => x.TenantId == tenantId && x.Status == status)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MrpPlan>> GetByTypeAsync(Guid tenantId, MrpPlanType type, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Where(x => x.TenantId == tenantId && x.Type == type)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MrpPlan>> GetByDateRangeAsync(Guid tenantId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Where(x => x.TenantId == tenantId &&
                        x.PlanningHorizonStart >= startDate &&
                        x.PlanningHorizonEnd <= endDate)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<MrpPlan?> GetLatestCompletedAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Where(x => x.TenantId == tenantId && x.Status == MrpPlanStatus.Tamamlandı)
            .OrderByDescending(x => x.ExecutionEndTime)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<MrpPlan?> GetWithRequirementsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Include(x => x.Requirements)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<MrpPlan?> GetWithPlannedOrdersAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Include(x => x.PlannedOrders)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<MrpPlan?> GetWithExceptionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Include(x => x.Exceptions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<MrpPlan?> GetFullAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.MrpPlans
            .Include(x => x.Requirements)
            .Include(x => x.PlannedOrders)
            .Include(x => x.Exceptions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<PlannedOrder>> GetPlannedOrdersByProductAsync(Guid tenantId, int productId, CancellationToken cancellationToken = default)
    {
        return await _context.PlannedOrders
            .Where(x => x.TenantId == tenantId && x.ProductId == productId)
            .OrderBy(x => x.PlannedStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PlannedOrder>> GetPlannedOrdersByStatusAsync(Guid tenantId, PlannedOrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.PlannedOrders
            .Where(x => x.TenantId == tenantId && x.Status == status)
            .OrderBy(x => x.PlannedStartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MrpException>> GetUnresolvedExceptionsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.MrpExceptions
            .Where(x => x.TenantId == tenantId && !x.IsResolved)
            .OrderByDescending(x => x.Severity)
            .ThenByDescending(x => x.OccurredAt)
            .ToListAsync(cancellationToken);
    }

    public void Add(MrpPlan plan)
    {
        _context.MrpPlans.Add(plan);
    }

    public void Update(MrpPlan plan)
    {
        _context.MrpPlans.Update(plan);
    }

    public void Delete(MrpPlan plan)
    {
        _context.MrpPlans.Remove(plan);
    }
}
