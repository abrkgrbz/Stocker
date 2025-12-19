using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetActivityByIdQuery : IRequest<ActivityDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Handler for GetActivityByIdQuery
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetActivityByIdQueryHandler : IRequestHandler<GetActivityByIdQuery, ActivityDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetActivityByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ActivityDto?> Handle(GetActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var activity = await _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == tenantId, cancellationToken);

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
