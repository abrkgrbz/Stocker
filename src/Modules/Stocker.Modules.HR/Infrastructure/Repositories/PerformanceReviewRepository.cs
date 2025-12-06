using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for PerformanceReview entity
/// </summary>
public class PerformanceReviewRepository : BaseRepository<PerformanceReview>, IPerformanceReviewRepository
{
    public PerformanceReviewRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<PerformanceReview?> GetWithCriteriaAsync(int reviewId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Criteria.Where(c => !c.IsDeleted))
            .Where(r => !r.IsDeleted && r.Id == reviewId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PerformanceReview?> GetWithGoalsAsync(int reviewId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.PerformanceGoals.Where(g => !g.IsDeleted))
            .Where(r => !r.IsDeleted && r.Id == reviewId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => !r.IsDeleted && r.EmployeeId == employeeId)
            .OrderByDescending(r => r.ReviewPeriodEnd)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetByReviewerAsync(int reviewerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Where(r => !r.IsDeleted && r.ReviewerId == reviewerId)
            .OrderByDescending(r => r.ReviewPeriodEnd)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetByPeriodAsync(DateTime periodStart, DateTime periodEnd, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Where(r => !r.IsDeleted &&
                   r.ReviewPeriodStart >= periodStart &&
                   r.ReviewPeriodEnd <= periodEnd)
            .OrderBy(r => r.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetByStatusAsync(PerformanceReviewStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Where(r => !r.IsDeleted && r.Status == status)
            .OrderByDescending(r => r.ReviewPeriodEnd)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetPendingReviewsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Where(r => !r.IsDeleted &&
                   (r.Status == PerformanceReviewStatus.Draft ||
                    r.Status == PerformanceReviewStatus.Submitted ||
                    r.Status == PerformanceReviewStatus.PendingAcknowledgment))
            .OrderBy(r => r.ReviewPeriodEnd)
            .ToListAsync(cancellationToken);
    }

    public async Task<PerformanceReview?> GetLatestByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(r => !r.IsDeleted &&
                   r.EmployeeId == employeeId &&
                   r.Status == PerformanceReviewStatus.Approved)
            .OrderByDescending(r => r.ReviewPeriodEnd)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetPendingByReviewerAsync(int reviewerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Where(r => !r.IsDeleted &&
                   r.ReviewerId == reviewerId &&
                   (r.Status == PerformanceReviewStatus.Draft ||
                    r.Status == PerformanceReviewStatus.Submitted ||
                    r.Status == PerformanceReviewStatus.PendingAcknowledgment))
            .OrderBy(r => r.ReviewPeriodEnd)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Where(r => !r.IsDeleted && r.Year == year)
            .OrderBy(r => r.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceReview>> GetByYearAndQuarterAsync(int year, int quarter, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Where(r => !r.IsDeleted && r.Year == year && r.Quarter == quarter)
            .OrderBy(r => r.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<(int DepartmentId, decimal AverageRating, int ReviewCount)>> GetDepartmentSummaryAsync(int year, CancellationToken cancellationToken = default)
    {
        var reviews = await DbSet
            .Include(r => r.Employee)
            .Where(r => !r.IsDeleted &&
                   r.Year == year &&
                   r.Status == PerformanceReviewStatus.Approved &&
                   r.OverallRating.HasValue)
            .GroupBy(r => r.Employee.DepartmentId)
            .Select(g => new
            {
                DepartmentId = g.Key,
                AverageRating = g.Average(r => (int)r.OverallRating!.Value),
                ReviewCount = g.Count()
            })
            .ToListAsync(cancellationToken);

        return reviews.Select(r => (r.DepartmentId, (decimal)r.AverageRating, r.ReviewCount)).ToList();
    }
}
