using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetCalendarActivitiesQuery : IRequest<IEnumerable<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid? AssignedToId { get; set; }
}

public class GetCalendarActivitiesQueryHandler : IRequestHandler<GetCalendarActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly CRMDbContext _context;

    public GetCalendarActivitiesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetCalendarActivitiesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Activities
            .Where(a => a.TenantId == request.TenantId)
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