using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

/// <summary>
/// Query to get activities for a specific opportunity
/// </summary>
public class GetOpportunityActivitiesQuery : IRequest<Result<IEnumerable<ActivityDto>>>
{
    public Guid OpportunityId { get; set; }
    public ActivityType? Type { get; set; }
    public ActivityStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? AssignedToId { get; set; }
    public string? Search { get; set; }
    public string? SortBy { get; set; } = "ScheduledDate";
    public string? SortDirection { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Validator for GetOpportunityActivitiesQuery
/// </summary>
public class GetOpportunityActivitiesQueryValidator : AbstractValidator<GetOpportunityActivitiesQuery>
{
    public GetOpportunityActivitiesQueryValidator()
    {
        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid activity type")
            .When(x => x.Type.HasValue);

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid activity status")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.FromDate)
            .LessThanOrEqualTo(x => x.ToDate).WithMessage("From date must be less than or equal to To date")
            .When(x => x.FromDate.HasValue && x.ToDate.HasValue);

        RuleFor(x => x.Search)
            .MaximumLength(500).WithMessage("Search term must not exceed 500 characters");

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField).WithMessage("Invalid sort field")
            .When(x => !string.IsNullOrEmpty(x.SortBy));

        RuleFor(x => x.SortDirection)
            .Must(BeValidSortDirection).WithMessage("Sort direction must be 'asc' or 'desc'")
            .When(x => !string.IsNullOrEmpty(x.SortDirection));

        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");
    }

    private bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrEmpty(sortBy))
            return true;

        var validFields = new[] { "Subject", "Type", "Status", "ScheduledDate", "CompletedDate", "Priority", "CreatedAt", "UpdatedAt" };
        return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
    }

    private bool BeValidSortDirection(string? sortDirection)
    {
        if (string.IsNullOrEmpty(sortDirection))
            return true;

        return sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase) ||
               sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetOpportunityActivitiesQueryHandler : IRequestHandler<GetOpportunityActivitiesQuery, Result<IEnumerable<ActivityDto>>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetOpportunityActivitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IEnumerable<ActivityDto>>> Handle(GetOpportunityActivitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .FirstOrDefaultAsync(o => o.Id == request.OpportunityId && o.TenantId == tenantId, cancellationToken);

        if (opportunity == null)
            return Result<IEnumerable<ActivityDto>>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.OpportunityId} not found"));

        var query = _unitOfWork.ReadRepository<Domain.Entities.Activity>().AsQueryable()
            .Where(a => a.TenantId == tenantId && a.OpportunityId == request.OpportunityId);

        if (request.Type.HasValue)
            query = query.Where(a => a.Type == request.Type.Value);

        if (request.Status.HasValue)
            query = query.Where(a => a.Status == request.Status.Value);

        if (request.FromDate.HasValue)
            query = query.Where(a => a.DueDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.DueDate <= request.ToDate.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(a => a.Subject.Contains(request.Search) ||
                                      (a.Description != null && a.Description.Contains(request.Search)));
        }

        var activities = await query
            .OrderByDescending(a => a.DueDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = activities.Select(a => new ActivityDto
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
            OpportunityId = a.OpportunityId,
            IsOverdue = a.IsOverdue()
        });

        return Result<IEnumerable<ActivityDto>>.Success(dtos);
    }
}