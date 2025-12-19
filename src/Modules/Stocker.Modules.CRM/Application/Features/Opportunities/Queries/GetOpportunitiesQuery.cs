using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetOpportunitiesQuery : IRequest<IEnumerable<OpportunityDto>>
{
    public string? Search { get; set; }
    public OpportunityStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? PipelineId { get; set; }
    public Guid? StageId { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetOpportunitiesQueryHandler : IRequestHandler<GetOpportunitiesQuery, IEnumerable<OpportunityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetOpportunitiesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<OpportunityDto>> Handle(GetOpportunitiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .Where(o => o.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(o => o.Name.Contains(request.Search) ||
                                      (o.Description != null && o.Description.Contains(request.Search)));
        }

        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(o => o.CustomerId == request.CustomerId.Value);

        if (request.PipelineId.HasValue)
            query = query.Where(o => o.PipelineId == request.PipelineId.Value);

        if (request.StageId.HasValue)
            query = query.Where(o => o.StageId == request.StageId.Value);

        if (request.MinAmount.HasValue)
            query = query.Where(o => o.Amount.Amount >= request.MinAmount.Value);

        if (request.MaxAmount.HasValue)
            query = query.Where(o => o.Amount.Amount <= request.MaxAmount.Value);

        if (request.FromDate.HasValue)
            query = query.Where(o => o.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(o => o.CreatedAt <= request.ToDate.Value);

        var opportunities = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return opportunities.Select(o => new OpportunityDto
        {
            Id = o.Id,
            Name = o.Name,
            Description = o.Description,
            CustomerId = o.CustomerId ?? Guid.Empty,
            Amount = o.Amount.Amount,
            Currency = o.Amount.Currency,
            Probability = o.Probability,
            ExpectedCloseDate = o.ExpectedCloseDate,
            Status = o.Status,
            PipelineId = o.PipelineId,
            PipelineName = o.Pipeline?.Name,
            CurrentStageId = o.StageId,
            CurrentStageName = o.Stage?.Name,
            LostReason = o.LostReason,
            CompetitorName = o.CompetitorName,
            OwnerId = o.OwnerId.ToString(),
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt
        });
    }
}