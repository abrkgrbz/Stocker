using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetCalendarActivitiesQuery : IRequest<IEnumerable<ActivityDto>>
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid? AssignedToId { get; set; }
}

/// <summary>
/// Handler for GetCalendarActivitiesQuery
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCalendarActivitiesQueryHandler : IRequestHandler<GetCalendarActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCalendarActivitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetCalendarActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .Where(a => a.TenantId == tenantId)
            .Where(a => a.DueDate >= request.StartDate && a.DueDate <= request.EndDate);

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
