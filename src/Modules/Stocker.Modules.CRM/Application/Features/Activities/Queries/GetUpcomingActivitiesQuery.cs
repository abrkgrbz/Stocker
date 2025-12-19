using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetUpcomingActivitiesQuery : IRequest<IEnumerable<ActivityDto>>
{
    public int Days { get; set; } = 7;
    public Guid? AssignedToId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetUpcomingActivitiesQueryHandler : IRequestHandler<GetUpcomingActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetUpcomingActivitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetUpcomingActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var now = DateTime.UtcNow;
        var endDate = now.AddDays(request.Days);

        var query = _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .Where(a => a.TenantId == tenantId)
            .Where(a => a.Status != ActivityStatus.Completed && a.Status != ActivityStatus.Cancelled)
            .Where(a => a.DueDate.HasValue && a.DueDate.Value >= now && a.DueDate.Value <= endDate);

        var activities = await query
            .OrderBy(a => a.DueDate)
            .ToListAsync(cancellationToken);

        return activities.Select(a => new ActivityDto
        {
            Id = a.Id,
            Subject = a.Subject,
            Description = a.Description,
            Type = a.Type,
            Status = a.Status,
            Priority = a.Priority,
            DueAt = a.DueDate,
            CompletedAt = a.CompletedDate,
            Duration = a.Duration,
            Location = a.Location,
            LeadId = a.LeadId,
            CustomerId = a.CustomerId,
            ContactId = a.ContactId,
            OpportunityId = a.OpportunityId,
            DealId = a.DealId,
            OwnerId = a.OwnerId,
            IsOverdue = a.IsOverdue(),
            Outcome = a.TaskOutcome
        }).ToList();
    }
}