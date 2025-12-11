using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for CareerPath entity
/// </summary>
public interface ICareerPathRepository : IHRRepository<CareerPath>
{
    /// <summary>
    /// Gets all career paths with optional filters and pagination
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<CareerPath>> GetAllAsync(
        int? employeeId = null,
        CareerPathStatus? status = null,
        CareerTrack? careerTrack = null,
        bool? readyForPromotion = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets career paths by employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<CareerPath>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active career paths
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<CareerPath>> GetActivePathsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets career paths ready for promotion
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<CareerPath>> GetReadyForPromotionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets career paths by mentor
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<CareerPath>> GetByMentorIdAsync(int mentorId, CancellationToken cancellationToken = default);
}
