using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for PerformanceGoal entity
/// </summary>
public class PerformanceGoalRepository : BaseRepository<PerformanceGoal>, IPerformanceGoalRepository
{
    public PerformanceGoalRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(g => !g.IsDeleted && g.EmployeeId == employeeId)
            .OrderByDescending(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetByPerformanceReviewAsync(int performanceReviewId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(g => !g.IsDeleted && g.PerformanceReviewId == performanceReviewId)
            .OrderByDescending(g => g.Weight)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetByStatusAsync(GoalStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(g => !g.IsDeleted && g.Status == status)
            .OrderBy(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetActiveGoalsAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(g => !g.IsDeleted &&
                   g.EmployeeId == employeeId &&
                   (g.Status == GoalStatus.NotStarted ||
                    g.Status == GoalStatus.InProgress ||
                    g.Status == GoalStatus.Deferred))
            .OrderBy(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetOverdueGoalsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Include(g => g.Employee)
            .Where(g => !g.IsDeleted &&
                   g.DueDate < today &&
                   g.Status != GoalStatus.Completed &&
                   g.Status != GoalStatus.Cancelled)
            .OrderBy(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetActiveByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(g => !g.IsDeleted &&
                   g.EmployeeId == employeeId &&
                   (g.Status == GoalStatus.NotStarted ||
                    g.Status == GoalStatus.InProgress ||
                    g.Status == GoalStatus.Deferred))
            .OrderBy(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetOverdueAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Include(g => g.Employee)
            .Where(g => !g.IsDeleted &&
                   g.DueDate < today &&
                   g.Status != GoalStatus.Completed &&
                   g.Status != GoalStatus.Cancelled)
            .OrderBy(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PerformanceGoal>> GetDueSoonAsync(int daysThreshold = 14, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(daysThreshold);

        return await DbSet
            .Include(g => g.Employee)
            .Where(g => !g.IsDeleted &&
                   g.DueDate >= today &&
                   g.DueDate <= endDate &&
                   g.Status != GoalStatus.Completed &&
                   g.Status != GoalStatus.Cancelled)
            .OrderBy(g => g.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(int Total, int Completed, int InProgress, int Overdue, decimal CompletionRate)> GetEmployeeSummaryAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var goals = await DbSet
            .Where(g => !g.IsDeleted && g.EmployeeId == employeeId)
            .ToListAsync(cancellationToken);

        var total = goals.Count;
        var completed = goals.Count(g => g.Status == GoalStatus.Completed);
        var inProgress = goals.Count(g => g.Status == GoalStatus.InProgress);
        var overdue = goals.Count(g =>
            g.DueDate < today &&
            g.Status != GoalStatus.Completed &&
            g.Status != GoalStatus.Cancelled);

        var completionRate = total > 0 ? (decimal)completed / total * 100 : 0;

        return (total, completed, inProgress, overdue, completionRate);
    }
}
