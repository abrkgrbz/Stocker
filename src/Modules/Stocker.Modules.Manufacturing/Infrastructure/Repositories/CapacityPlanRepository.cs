using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class CapacityPlanRepository : ICapacityPlanRepository
{
    private readonly ManufacturingDbContext _context;

    public CapacityPlanRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<CapacityPlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<CapacityPlan?> GetByPlanNumberAsync(string planNumber, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .FirstOrDefaultAsync(x => x.PlanNumber == planNumber, cancellationToken);
    }

    public async Task<CapacityPlan?> GetWithRequirementsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .Include(x => x.Requirements)
                .ThenInclude(r => r.WorkCenter)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<CapacityPlan?> GetWithExceptionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .Include(x => x.Exceptions)
                .ThenInclude(e => e.WorkCenter)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<CapacityPlan?> GetFullPlanAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .Include(x => x.Requirements)
                .ThenInclude(r => r.WorkCenter)
            .Include(x => x.Requirements)
                .ThenInclude(r => r.LoadDetails)
            .Include(x => x.Exceptions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityPlan>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityPlan>> GetByMrpPlanAsync(int mrpPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .Where(x => x.MrpPlanId == mrpPlanId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityPlan>> GetByStatusAsync(CapacityPlanStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityPlan>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityPlans
            .Where(x => x.PlanningHorizonStart >= startDate && x.PlanningHorizonEnd <= endDate)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityRequirement>> GetRequirementsByWorkCenterAsync(int workCenterId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityRequirements
            .Include(x => x.CapacityPlan)
            .Where(x => x.WorkCenterId == workCenterId &&
                        x.PeriodDate >= startDate &&
                        x.PeriodDate <= endDate)
            .OrderBy(x => x.PeriodDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityRequirement>> GetRequirementsByPlanAsync(int capacityPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityRequirements
            .Include(x => x.WorkCenter)
            .Where(x => x.CapacityPlanId == capacityPlanId)
            .OrderBy(x => x.WorkCenterId)
            .ThenBy(x => x.PeriodDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityRequirement>> GetOverloadedRequirementsAsync(int capacityPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityRequirements
            .Include(x => x.WorkCenter)
            .Where(x => x.CapacityPlanId == capacityPlanId &&
                        (x.Status == CapacityStatus.Aşırı || x.Status == CapacityStatus.Darboğaz))
            .OrderBy(x => x.PeriodDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityException>> GetUnresolvedExceptionsAsync(int capacityPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityExceptions
            .Include(x => x.WorkCenter)
            .Where(x => x.CapacityPlanId == capacityPlanId && !x.IsResolved)
            .OrderByDescending(x => x.Severity)
            .ThenBy(x => x.PeriodDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CapacityLoadDetail>> GetLoadDetailsByRequirementAsync(int requirementId, CancellationToken cancellationToken = default)
    {
        return await _context.CapacityLoadDetails
            .Include(x => x.ProductionOrder)
            .Include(x => x.Operation)
            .Where(x => x.CapacityRequirementId == requirementId)
            .OrderBy(x => x.PlannedStartDate)
            .ToListAsync(cancellationToken);
    }

    public void Add(CapacityPlan plan)
    {
        _context.CapacityPlans.Add(plan);
    }

    public void Update(CapacityPlan plan)
    {
        _context.CapacityPlans.Update(plan);
    }

    public void Delete(CapacityPlan plan)
    {
        _context.CapacityPlans.Remove(plan);
    }

    public void AddRequirement(CapacityRequirement requirement)
    {
        _context.CapacityRequirements.Add(requirement);
    }

    public void AddException(CapacityException exception)
    {
        _context.CapacityExceptions.Add(exception);
    }

    public void AddLoadDetail(CapacityLoadDetail detail)
    {
        _context.CapacityLoadDetails.Add(detail);
    }
}
