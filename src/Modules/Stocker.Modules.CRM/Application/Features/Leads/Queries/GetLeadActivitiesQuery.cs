using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadActivitiesQuery : IRequest<IEnumerable<ActivityDto>>
{
    public Guid LeadId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetLeadActivitiesQueryHandler : IRequestHandler<GetLeadActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetLeadActivitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetLeadActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var activities = await _unitOfWork.ReadRepository<Domain.Entities.Activity>().AsQueryable()
            .Where(a => a.LeadId == request.LeadId && a.TenantId == tenantId)
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
