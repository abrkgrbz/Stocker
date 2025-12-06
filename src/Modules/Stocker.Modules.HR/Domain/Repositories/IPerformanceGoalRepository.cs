using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for PerformanceGoal entity
/// </summary>
public interface IPerformanceGoalRepository : IHRRepository<PerformanceGoal>
{
    /// <summary>
    /// Gets goals by employee
    /// </summary>
    Task<IReadOnlyList<PerformanceGoal>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active goals by employee
    /// </summary>
    Task<IReadOnlyList<PerformanceGoal>> GetActiveByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets goals by performance review
    /// </summary>
    Task<IReadOnlyList<PerformanceGoal>> GetByPerformanceReviewAsync(int performanceReviewId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets overdue goals
    /// </summary>
    Task<IReadOnlyList<PerformanceGoal>> GetOverdueAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets goals due soon
    /// </summary>
    Task<IReadOnlyList<PerformanceGoal>> GetDueSoonAsync(int daysThreshold = 14, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets goal completion summary by employee
    /// </summary>
    Task<(int Total, int Completed, int InProgress, int Overdue, decimal CompletionRate)> GetEmployeeSummaryAsync(int employeeId, CancellationToken cancellationToken = default);
}
