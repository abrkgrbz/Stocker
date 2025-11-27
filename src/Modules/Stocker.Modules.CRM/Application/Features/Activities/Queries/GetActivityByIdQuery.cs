using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetActivityByIdQuery : IRequest<ActivityDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetActivityByIdQueryHandler : IRequestHandler<GetActivityByIdQuery, ActivityDto?>
{
    private readonly CRMDbContext _context;

    public GetActivityByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<ActivityDto?> Handle(GetActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == request.TenantId, cancellationToken);

        if (activity == null)
            return null;

        return new ActivityDto
        {
            Id = activity.Id,
            Subject = activity.Subject,
            Description = activity.Description,
            Type = activity.Type,
            Status = activity.Status,
            Priority = activity.Priority,
            DueAt = activity.DueDate,
            CompletedAt = activity.CompletedDate,
            Duration = activity.Duration,
            Location = activity.Location,
            LeadId = activity.LeadId,
            CustomerId = activity.CustomerId,
            ContactId = activity.ContactId,
            OpportunityId = activity.OpportunityId,
            DealId = activity.DealId,
            OwnerId = activity.OwnerId,
            IsOverdue = activity.IsOverdue(),
            Outcome = activity.TaskOutcome
        };
    }
}