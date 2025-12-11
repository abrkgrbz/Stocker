using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Onboarding entity
/// </summary>
public interface IOnboardingRepository : IHRRepository<Onboarding>
{
    /// <summary>
    /// Gets an onboarding record by ID with all related data
    /// </summary>
    System.Threading.Tasks.Task<Onboarding?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all onboarding records with optional filters and pagination
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetAllAsync(
        int? employeeId = null,
        OnboardingStatus? status = null,
        DateTime? startDateFrom = null,
        DateTime? startDateTo = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets onboarding records by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets onboarding records by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByStatusAsync(OnboardingStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets onboarding records by buddy
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByBuddyAsync(int buddyId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets onboarding records by HR responsible
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<Onboarding>> GetByHrResponsibleAsync(int hrResponsibleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new onboarding record
    /// </summary>
    System.Threading.Tasks.Task<Onboarding> CreateAsync(Onboarding onboarding, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing onboarding record
    /// </summary>
    System.Threading.Tasks.Task<Onboarding> UpdateAsync(Onboarding onboarding, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an onboarding record
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
