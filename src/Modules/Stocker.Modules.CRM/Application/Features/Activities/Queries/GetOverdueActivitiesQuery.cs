using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetOverdueActivitiesQuery : IRequest<IEnumerable<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid? AssignedToId { get; set; }
}

public class GetOverdueActivitiesQueryHandler : IRequestHandler<GetOverdueActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly CRMDbContext _context;

    public GetOverdueActivitiesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetOverdueActivitiesQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var query = _context.Activities
            .Where(a => a.TenantId == request.TenantId)
            .Where(a => a.Status != ActivityStatus.Completed && a.Status != ActivityStatus.Cancelled)
            .Where(a => a.DueDate.HasValue && a.DueDate.Value < now);

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
            IsOverdue = true,
            Outcome = a.TaskOutcome
        }).ToList();
    }
}