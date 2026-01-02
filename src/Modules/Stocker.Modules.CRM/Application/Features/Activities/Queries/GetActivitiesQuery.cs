using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.Activities.Queries;

public class GetActivitiesQuery : IRequest<PagedResult<ActivityDto>>
{
    public ActivityType? Type { get; set; }
    public ActivityStatus? Status { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? DealId { get; set; }
    public int? OwnerId { get; set; }
    public int? AssignedToId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? Overdue { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Handler for GetActivitiesQuery
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetActivitiesQueryHandler : IRequestHandler<GetActivitiesQuery, PagedResult<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetActivitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ActivityDto>> Handle(GetActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .Where(a => a.TenantId == tenantId);

        // Apply filters
        if (request.Type.HasValue)
            query = query.Where(a => a.Type == request.Type.Value);

        if (request.Status.HasValue)
            query = query.Where(a => a.Status == request.Status.Value);

        if (request.LeadId.HasValue)
            query = query.Where(a => a.LeadId == request.LeadId.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(a => a.CustomerId == request.CustomerId.Value);

        if (request.OpportunityId.HasValue)
            query = query.Where(a => a.OpportunityId == request.OpportunityId.Value);

        if (request.DealId.HasValue)
            query = query.Where(a => a.DealId == request.DealId.Value);

        if (request.OwnerId.HasValue)
            query = query.Where(a => a.OwnerId == request.OwnerId.Value);

        if (request.AssignedToId.HasValue)
            query = query.Where(a => a.AssignedToId == request.AssignedToId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(a => a.DueDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.DueDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var activities = await query
            .OrderByDescending(a => a.DueDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Filter overdue in-memory if needed
        if (request.Overdue.HasValue && request.Overdue.Value)
        {
            activities = activities.Where(a => a.IsOverdue()).ToList();
        }

        var items = activities.Select(a => new ActivityDto
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

        return new PagedResult<ActivityDto>(items, request.Page, request.PageSize, totalCount);
    }
}
