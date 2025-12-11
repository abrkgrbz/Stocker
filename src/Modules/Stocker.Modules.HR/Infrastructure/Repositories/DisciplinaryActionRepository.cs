using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for DisciplinaryAction entity
/// </summary>
public class DisciplinaryActionRepository : BaseRepository<DisciplinaryAction>, IDisciplinaryActionRepository
{
    public DisciplinaryActionRepository(HRDbContext context) : base(context)
    {
    }

    public override async Task<DisciplinaryAction?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Employee)
            .Include(d => d.Investigator)
            .Include(d => d.DecisionMaker)
            .Include(d => d.ReportedBy)
            .Include(d => d.HrRepresentative)
            .Where(d => !d.IsDeleted && d.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DisciplinaryAction>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Employee)
            .Include(d => d.Investigator)
            .Include(d => d.DecisionMaker)
            .Where(d => !d.IsDeleted && d.EmployeeId == employeeId)
            .OrderByDescending(d => d.IncidentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DisciplinaryAction>> GetPendingActionsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Employee)
            .Include(d => d.Investigator)
            .Where(d => !d.IsDeleted &&
                   (d.Status == DisciplinaryStatus.Reported ||
                    d.Status == DisciplinaryStatus.UnderInvestigation ||
                    d.Status == DisciplinaryStatus.PendingDefense ||
                    d.Status == DisciplinaryStatus.PendingDecision))
            .OrderByDescending(d => d.IncidentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DisciplinaryAction>> GetBySeverityAsync(SeverityLevel severity, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Employee)
            .Include(d => d.Investigator)
            .Where(d => !d.IsDeleted && d.SeverityLevel == severity)
            .OrderByDescending(d => d.IncidentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetEmployeeWarningCountAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .CountAsync(d => !d.IsDeleted &&
                        d.EmployeeId == employeeId &&
                        (d.ActionType == DisciplinaryActionType.VerbalWarning ||
                         d.ActionType == DisciplinaryActionType.WrittenWarning ||
                         d.ActionType == DisciplinaryActionType.FinalWarning),
                        cancellationToken);
    }
}
