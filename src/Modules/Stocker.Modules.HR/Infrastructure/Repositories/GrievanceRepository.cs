using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Grievance entity
/// </summary>
public class GrievanceRepository : BaseRepository<Grievance>, IGrievanceRepository
{
    public GrievanceRepository(HRDbContext context) : base(context)
    {
    }

    public async System.Threading.Tasks.Task<Grievance?> GetByCodeAsync(string grievanceCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AccusedPerson)
            .Include(g => g.AssignedTo)
            .Include(g => g.HrRepresentative)
            .Where(g => !g.IsDeleted && g.GrievanceCode == grievanceCode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByComplainantAsync(int complainantId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AccusedPerson)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.ComplainantId == complainantId)
            .OrderByDescending(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByAccusedPersonAsync(int accusedPersonId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AccusedPerson)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.AccusedPersonId == accusedPersonId)
            .OrderByDescending(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByStatusAsync(GrievanceStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.Status == status)
            .OrderByDescending(g => g.Priority)
            .ThenBy(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByTypeAsync(GrievanceType grievanceType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.GrievanceType == grievanceType)
            .OrderByDescending(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByPriorityAsync(GrievancePriority priority, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.Priority == priority)
            .OrderByDescending(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetAssignedToAsync(int assignedToId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AccusedPerson)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.AssignedToId == assignedToId)
            .OrderByDescending(g => g.Priority)
            .ThenBy(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByHrRepresentativeAsync(int hrRepresentativeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AccusedPerson)
            .Include(g => g.HrRepresentative)
            .Where(g => !g.IsDeleted && g.HrRepresentativeId == hrRepresentativeId)
            .OrderByDescending(g => g.Priority)
            .ThenBy(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetOpenGrievancesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted &&
                   (g.Status == GrievanceStatus.Submitted ||
                    g.Status == GrievanceStatus.Acknowledged ||
                    g.Status == GrievanceStatus.UnderReview ||
                    g.Status == GrievanceStatus.UnderInvestigation ||
                    g.Status == GrievanceStatus.PendingResolution))
            .OrderByDescending(g => g.Priority)
            .ThenBy(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetRequiringInvestigationAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.InvestigationRequired && g.Status == GrievanceStatus.UnderInvestigation)
            .OrderByDescending(g => g.Priority)
            .ThenBy(g => g.InvestigationStartDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetEscalatedGrievancesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.WasEscalated)
            .OrderByDescending(g => g.EscalationLevel)
            .ThenByDescending(g => g.EscalationDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetOverdueGrievancesAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted &&
                   g.TargetResolutionDate.HasValue &&
                   g.TargetResolutionDate.Value < today &&
                   g.Status != GrievanceStatus.Resolved &&
                   g.Status != GrievanceStatus.Closed &&
                   g.Status != GrievanceStatus.Withdrawn)
            .OrderBy(g => g.TargetResolutionDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetFiledInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(g => g.Complainant)
            .Include(g => g.AssignedTo)
            .Where(g => !g.IsDeleted && g.FiledDate >= startDate && g.FiledDate <= endDate)
            .OrderByDescending(g => g.FiledDate)
            .ToListAsync(cancellationToken);
    }
}
