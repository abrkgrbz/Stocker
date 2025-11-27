using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadActivitiesQuery : IRequest<IEnumerable<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid LeadId { get; set; }
}

public class GetLeadActivitiesQueryHandler : IRequestHandler<GetLeadActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly CRMDbContext _context;

    public GetLeadActivitiesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetLeadActivitiesQuery request, CancellationToken cancellationToken)
    {
        var activities = await _context.Activities
            .Where(a => a.LeadId == request.LeadId && a.TenantId == request.TenantId)
            .OrderByDescending(a => a.DueDate)
            .ToListAsync(cancellationToken);

        return activities.Select(a => new ActivityDto
        {
            Id = a.Id,
            Type = a.Type,
            Subject = a.Subject,
            Description = a.Description,
            Status = a.Status,
            Priority = a.Priority,
            DueAt = a.DueDate,
            CompletedAt = a.CompletedDate,
            Duration = a.Duration,
            Location = a.Location,
            OwnerId = a.OwnerId,
            CustomerId = a.CustomerId,
            ContactId = a.ContactId,
            LeadId = a.LeadId,
            DealId = a.DealId,
            OpportunityId = a.OpportunityId,
            IsOverdue = a.IsOverdue(),
            Outcome = a.TaskOutcome
        }).ToList();
    }
}
