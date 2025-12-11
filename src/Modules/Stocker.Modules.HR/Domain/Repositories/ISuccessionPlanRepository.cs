using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for SuccessionPlan entity
/// </summary>
public interface ISuccessionPlanRepository : IHRRepository<SuccessionPlan>
{
    /// <summary>
    /// Gets a succession plan by ID with all related data
    /// </summary>
    System.Threading.Tasks.Task<SuccessionPlan?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all succession plans with optional filters and pagination
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetAllAsync(
        int? positionId = null,
        int? departmentId = null,
        SuccessionPlanStatus? status = null,
        SuccessionPriority? priority = null,
        RiskLevel? riskLevel = null,
        bool? isCriticalPosition = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets succession plans by position
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByPositionAsync(int positionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets succession plans by department
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets succession plans by status
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByStatusAsync(SuccessionPlanStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets critical succession plans
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetCriticalPlansAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets succession plans by risk level
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<SuccessionPlan>> GetByRiskLevelAsync(RiskLevel riskLevel, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new succession plan
    /// </summary>
    System.Threading.Tasks.Task<SuccessionPlan> CreateAsync(SuccessionPlan successionPlan, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing succession plan
    /// </summary>
    System.Threading.Tasks.Task<SuccessionPlan> UpdateAsync(SuccessionPlan successionPlan, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a succession plan
    /// </summary>
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
