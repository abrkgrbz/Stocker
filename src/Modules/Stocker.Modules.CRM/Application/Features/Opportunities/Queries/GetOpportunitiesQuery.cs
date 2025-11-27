using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetOpportunitiesQuery : IRequest<IEnumerable<OpportunityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
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

public class GetOpportunitiesQueryHandler : IRequestHandler<GetOpportunitiesQuery, IEnumerable<OpportunityDto>>
{
    private readonly CRMDbContext _context;

    public GetOpportunitiesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OpportunityDto>> Handle(GetOpportunitiesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Opportunities
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .Where(o => o.TenantId == request.TenantId);

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