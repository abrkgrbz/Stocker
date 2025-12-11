using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Grievance entity
/// </summary>
public interface IGrievanceRepository : IHRRepository<Grievance>
{
    /// <summary>
    /// Gets a grievance by code
    /// </summary>
    System.Threading.Tasks.Task<Grievance?> GetByCodeAsync(string grievanceCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances by complainant
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByComplainantAsync(int complainantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances by accused person
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByAccusedPersonAsync(int accusedPersonId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByStatusAsync(GrievanceStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances by type
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByTypeAsync(GrievanceType grievanceType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances by priority
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByPriorityAsync(GrievancePriority priority, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances assigned to a person
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetAssignedToAsync(int assignedToId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances by HR representative
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetByHrRepresentativeAsync(int hrRepresentativeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets open grievances
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetOpenGrievancesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances requiring investigation
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetRequiringInvestigationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets escalated grievances
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetEscalatedGrievancesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances overdue for resolution
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetOverdueGrievancesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets grievances filed in date range
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Grievance>> GetFiledInRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
