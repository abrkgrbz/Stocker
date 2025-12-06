using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for PerformanceReview entity
/// </summary>
public interface IPerformanceReviewRepository : IHRRepository<PerformanceReview>
{
    /// <summary>
    /// Gets a performance review with criteria
    /// </summary>
    Task<PerformanceReview?> GetWithCriteriaAsync(int reviewId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a performance review with goals
    /// </summary>
    Task<PerformanceReview?> GetWithGoalsAsync(int reviewId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets performance reviews by employee
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets performance reviews by reviewer
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetByReviewerAsync(int reviewerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending reviews for a reviewer
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetPendingByReviewerAsync(int reviewerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reviews by date period
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetByPeriodAsync(DateTime periodStart, DateTime periodEnd, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reviews by status
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetByStatusAsync(PerformanceReviewStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending reviews
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetPendingReviewsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the latest review for an employee
    /// </summary>
    Task<PerformanceReview?> GetLatestByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reviews by year
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetByYearAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets reviews by year and quarter
    /// </summary>
    Task<IReadOnlyList<PerformanceReview>> GetByYearAndQuarterAsync(int year, int quarter, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets performance summary by department for a year
    /// </summary>
    Task<IReadOnlyList<(int DepartmentId, decimal AverageRating, int ReviewCount)>> GetDepartmentSummaryAsync(int year, CancellationToken cancellationToken = default);
}
