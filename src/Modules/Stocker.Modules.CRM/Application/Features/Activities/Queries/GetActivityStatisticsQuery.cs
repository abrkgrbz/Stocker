using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetActivityStatisticsQuery : IRequest<ActivityStatisticsDto>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? OwnerId { get; set; }
}

/// <summary>
/// Handler for GetActivityStatisticsQuery
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetActivityStatisticsQueryHandler : IRequestHandler<GetActivityStatisticsQuery, ActivityStatisticsDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetActivityStatisticsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ActivityStatisticsDto> Handle(GetActivityStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .Where(a => a.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(a => a.DueDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.DueDate <= request.ToDate.Value);

        if (request.OwnerId.HasValue)
            query = query.Where(a => a.OwnerId == request.OwnerId.Value);

        var activities = await query.ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var today = now.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);

        var totalActivities = activities.Count;
        var completedActivities = activities.Count(a => a.Status == ActivityStatus.Completed);
        var pendingActivities = activities.Count(a => a.Status == ActivityStatus.NotStarted || a.Status == ActivityStatus.InProgress);
        var overdueActivities = activities.Count(a => a.IsOverdue());
        var todayActivities = activities.Count(a => a.DueDate.HasValue && a.DueDate.Value.Date == today);
        var thisWeekActivities = activities.Count(a => a.DueDate.HasValue && a.DueDate.Value.Date >= weekStart && a.DueDate.Value.Date <= today.AddDays(6 - (int)today.DayOfWeek));
        var completedTodayActivities = activities.Count(a => a.Status == ActivityStatus.Completed && a.CompletedDate.HasValue && a.CompletedDate.Value.Date == today);

        var completionRate = totalActivities > 0 ? (decimal)completedActivities / totalActivities * 100 : 0;

        var activitiesByType = activities
            .GroupBy(a => a.Type)
            .ToDictionary(g => g.Key, g => g.Count());

        var activitiesByStatus = activities
            .GroupBy(a => a.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        var dailyActivities = activities
            .Where(a => a.DueDate.HasValue)
            .GroupBy(a => a.DueDate!.Value.Date)
            .OrderBy(g => g.Key)
            .Take(30)
            .Select(g => new DailyActivityDto
            {
                Date = g.Key,
                CreatedCount = g.Count(),
                CompletedCount = g.Count(a => a.Status == ActivityStatus.Completed),
                OverdueCount = g.Count(a => a.IsOverdue())
            })
            .ToList();

        return new ActivityStatisticsDto
        {
            TotalActivities = totalActivities,
            TodayActivities = todayActivities,
            OverdueActivities = overdueActivities,
            ThisWeekActivities = thisWeekActivities,
            CompletedTodayActivities = completedTodayActivities,
            CompletedActivities = completedActivities,
            PendingActivities = pendingActivities,
            CompletionRate = Math.Round(completionRate, 2),
            ActivitiesByType = activitiesByType,
            ActivitiesByStatus = activitiesByStatus,
            DailyActivities = dailyActivities
        };
    }
}
