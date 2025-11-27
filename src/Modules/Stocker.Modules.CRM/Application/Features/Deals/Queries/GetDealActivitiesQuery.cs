using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealActivitiesQuery : IRequest<IEnumerable<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid DealId { get; set; }
}

public class GetDealActivitiesQueryHandler : IRequestHandler<GetDealActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly CRMDbContext _context;

    public GetDealActivitiesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetDealActivitiesQuery request, CancellationToken cancellationToken)
    {
        var activities = await _context.Activities
            .Where(a => a.TenantId == request.TenantId && a.DealId == request.DealId)
            .OrderByDescending(a => a.DueDate)
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
            OwnerId = a.OwnerId,
            LeadId = a.LeadId,
            DealId = a.DealId,
            OpportunityId = a.OpportunityId,
            CustomerId = a.CustomerId,
            IsOverdue = a.IsOverdue()
        });
    }
}