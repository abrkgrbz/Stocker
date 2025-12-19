using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealActivitiesQuery : IRequest<IEnumerable<ActivityDto>>
{
    public Guid DealId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetDealActivitiesQueryHandler : IRequestHandler<GetDealActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetDealActivitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetDealActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var activities = await _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .Where(a => a.TenantId == tenantId && a.DealId == request.DealId)
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
