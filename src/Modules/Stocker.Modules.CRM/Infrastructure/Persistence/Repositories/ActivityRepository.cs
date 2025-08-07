using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Persistence.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Activity aggregate
/// </summary>
public class ActivityRepository : GenericRepository<Activity, CRMDbContext>, IActivityRepository
{
    public ActivityRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Activity>> GetByCustomerAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.CustomerId == customerId && !a.IsDeleted)
            .Include(a => a.Contact)
            .OrderByDescending(a => a.DueDate ?? a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetByContactAsync(Guid contactId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.ContactId == contactId && !a.IsDeleted)
            .Include(a => a.Customer)
            .OrderByDescending(a => a.DueDate ?? a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetByLeadAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.LeadId == leadId && !a.IsDeleted)
            .OrderByDescending(a => a.DueDate ?? a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetByOpportunityAsync(Guid opportunityId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.OpportunityId == opportunityId && !a.IsDeleted)
            .Include(a => a.Contact)
            .OrderByDescending(a => a.DueDate ?? a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetByAssigneeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.AssignedToUserId == userId && !a.IsDeleted)
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .OrderBy(a => a.DueDate)
            .ThenByDescending(a => a.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetOverdueActivitiesAsync(DateTime asOfDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted)
            .Where(a => a.Status != Domain.Enums.ActivityStatus.Completed && a.Status != Domain.Enums.ActivityStatus.Cancelled)
            .Where(a => a.DueDate.HasValue && a.DueDate.Value < asOfDate)
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .OrderBy(a => a.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetUpcomingActivitiesAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted)
            .Where(a => a.Status != Domain.Enums.ActivityStatus.Completed && a.Status != Domain.Enums.ActivityStatus.Cancelled)
            .Where(a => a.DueDate.HasValue && a.DueDate.Value >= startDate && a.DueDate.Value <= endDate)
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .OrderBy(a => a.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetByTypeAsync(ActivityType type, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.Type == type && !a.IsDeleted)
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> GetByStatusAsync(Domain.Enums.ActivityStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => a.Status == status && !a.IsDeleted)
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Activity?> GetWithDetailsAsync(Guid activityId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .Include(a => a.Lead)
            .Include(a => a.Opportunity)
            .FirstOrDefaultAsync(a => a.Id == activityId && !a.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Activity>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<Activity>();

        var lowerSearchTerm = searchTerm.ToLower();

        return await DbSet
            .Include(a => a.Customer)
            .Include(a => a.Contact)
            .Where(a => !a.IsDeleted && (
                a.Subject.ToLower().Contains(lowerSearchTerm) ||
                (a.Description != null && a.Description.ToLower().Contains(lowerSearchTerm)) ||
                (a.Customer != null && a.Customer.CompanyName.ToLower().Contains(lowerSearchTerm))
            ))
            .OrderByDescending(a => a.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<ActivityStatistics> GetStatisticsAsync(Guid? userId = null, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => !a.IsDeleted);

        if (userId.HasValue)
            query = query.Where(a => a.AssignedToUserId == userId.Value);

        if (startDate.HasValue)
            query = query.Where(a => a.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(a => a.CreatedAt <= endDate.Value);

        var activities = await query.ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        return new ActivityStatistics
        {
            TotalActivities = activities.Count,
            CompletedActivities = activities.Count(a => a.Status == ActivityStatus.Completed),
            PendingActivities = activities.Count(a => a.Status == ActivityStatus.Pending),
            InProgressActivities = activities.Count(a => a.Status == ActivityStatus.InProgress),
            CancelledActivities = activities.Count(a => a.Status == ActivityStatus.Cancelled),
            OverdueActivities = activities.Count(a => 
                a.Status != ActivityStatus.Completed && 
                a.Status != ActivityStatus.Cancelled && 
                a.DueDate.HasValue && 
                a.DueDate.Value < now),
            CallActivities = activities.Count(a => a.Type == ActivityType.Call),
            EmailActivities = activities.Count(a => a.Type == ActivityType.Email),
            MeetingActivities = activities.Count(a => a.Type == ActivityType.Meeting),
            TaskActivities = activities.Count(a => a.Type == ActivityType.Task),
            CompletionRate = activities.Count > 0 
                ? (decimal)activities.Count(a => a.Status == ActivityStatus.Completed) / activities.Count * 100 
                : 0,
            AverageCompletionTime = activities
                .Where(a => a.Status == ActivityStatus.Completed && a.CompletedDate.HasValue)
                .Select(a => (a.CompletedDate!.Value - a.CreatedAt).TotalHours)
                .DefaultIfEmpty(0)
                .Average()
        };
    }
}

/// <summary>
/// Activity statistics data
/// </summary>
public record ActivityStatistics
{
    public int TotalActivities { get; init; }
    public int CompletedActivities { get; init; }
    public int PendingActivities { get; init; }
    public int InProgressActivities { get; init; }
    public int CancelledActivities { get; init; }
    public int OverdueActivities { get; init; }
    public int CallActivities { get; init; }
    public int EmailActivities { get; init; }
    public int MeetingActivities { get; init; }
    public int TaskActivities { get; init; }
    public decimal CompletionRate { get; init; }
    public double AverageCompletionTime { get; init; }
}