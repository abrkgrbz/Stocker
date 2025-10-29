using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Activities.Queries;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Application.Features.Activities.Handlers;

public class GetActivitiesQueryHandler : IRequestHandler<GetActivitiesQuery, IEnumerable<ActivityDto>>
{
    private readonly CRMDbContext _context;

    public GetActivitiesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetActivitiesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Activities.AsQueryable();

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

        if (request.FromDate.HasValue)
            query = query.Where(a => a.DueDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.DueDate <= request.ToDate.Value);

        if (request.Overdue.HasValue && request.Overdue.Value)
            query = query.Where(a => a.Status != ActivityStatus.Completed &&
                                   a.Status != ActivityStatus.Cancelled &&
                                   a.DueDate.HasValue &&
                                   a.DueDate.Value < DateTime.UtcNow);

        // Apply pagination
        var activities = await query
            .OrderByDescending(a => a.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var activityDtos = activities.Select(a => new ActivityDto
        {
            Id = a.Id,
            // TenantId = a.TenantId,
            Subject = a.Subject,
            Description = a.Description,
            Type = a.Type,
            Status = a.Status,
            Priority = a.Priority,
            DueDate = a.DueDate ?? DateTime.UtcNow,
            Duration = (int?)a.Duration?.TotalMinutes,
            Location = a.Location,
            LeadId = a.LeadId,
            CustomerId = a.CustomerId,
            ContactId = a.ContactId,
            OpportunityId = a.OpportunityId,
            DealId = a.DealId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        }).ToList();

        return activityDtos;
    }
}
