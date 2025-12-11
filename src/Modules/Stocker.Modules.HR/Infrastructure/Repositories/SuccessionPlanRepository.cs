using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for SuccessionPlan entity
/// </summary>
public class SuccessionPlanRepository : BaseRepository<SuccessionPlan>, ISuccessionPlanRepository
{
    public SuccessionPlanRepository(HRDbContext context) : base(context)
    {
    }

    public override async System.Threading.Tasks.Task<SuccessionPlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Include(s => s.PlanOwner)
            .Include(s => s.HrResponsible)
            .Include(s => s.Candidates)
                .ThenInclude(c => c.Employee)
            .Where(s => !s.IsDeleted && s.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetAllAsync(
        int? positionId = null,
        int? departmentId = null,
        SuccessionPlanStatus? status = null,
        SuccessionPriority? priority = null,
        RiskLevel? riskLevel = null,
        bool? isCriticalPosition = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Where(s => !s.IsDeleted);

        if (positionId.HasValue)
            query = query.Where(s => s.PositionId == positionId.Value);

        if (departmentId.HasValue)
            query = query.Where(s => s.DepartmentId == departmentId.Value);

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(s => s.Priority == priority.Value);

        if (riskLevel.HasValue)
            query = query.Where(s => s.RiskLevel == riskLevel.Value);

        if (isCriticalPosition.HasValue)
            query = query.Where(s => s.IsCriticalPosition == isCriticalPosition.Value);

        query = query.OrderByDescending(s => s.Priority).ThenByDescending(s => s.RiskLevel);

        if (skip.HasValue)
            query = query.Skip(skip.Value);

        if (take.HasValue)
            query = query.Take(take.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByPositionAsync(int positionId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Include(s => s.Candidates)
            .Where(s => !s.IsDeleted && s.PositionId == positionId)
            .OrderByDescending(s => s.Priority)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Where(s => !s.IsDeleted && s.DepartmentId == departmentId)
            .OrderByDescending(s => s.Priority)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByStatusAsync(SuccessionPlanStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Where(s => !s.IsDeleted && s.Status == status)
            .OrderByDescending(s => s.Priority)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetCriticalPlansAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Include(s => s.Candidates)
            .Where(s => !s.IsDeleted && s.IsCriticalPosition)
            .OrderByDescending(s => s.Priority).ThenByDescending(s => s.RiskLevel)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByRiskLevelAsync(RiskLevel riskLevel, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(s => s.Position)
            .Include(s => s.Department)
            .Include(s => s.CurrentIncumbent)
            .Where(s => !s.IsDeleted && s.RiskLevel == riskLevel)
            .OrderByDescending(s => s.Priority)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SuccessionPlan> CreateAsync(SuccessionPlan successionPlan, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(successionPlan, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return successionPlan;
    }

    public async System.Threading.Tasks.Task<SuccessionPlan> UpdateAsync(SuccessionPlan successionPlan, CancellationToken cancellationToken = default)
    {
        DbSet.Update(successionPlan);
        await Context.SaveChangesAsync(cancellationToken);
        return successionPlan;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var successionPlan = await GetByIdAsync(id, cancellationToken);
        if (successionPlan != null)
        {
            successionPlan.Delete(string.Empty);
            await Context.SaveChangesAsync(cancellationToken);
        }
    }
}
