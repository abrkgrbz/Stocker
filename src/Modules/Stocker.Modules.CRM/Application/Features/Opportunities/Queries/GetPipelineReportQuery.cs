using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetPipelineReportQuery : IRequest<PipelineReportDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid? PipelineId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

public class GetPipelineReportQueryHandler : IRequestHandler<GetPipelineReportQuery, PipelineReportDto>
{
    private readonly CRMDbContext _context;

    public GetPipelineReportQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<PipelineReportDto> Handle(GetPipelineReportQuery request, CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddMonths(-12);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        var opportunitiesQuery = _context.Opportunities
            .Where(o => o.TenantId == request.TenantId && o.CreatedAt >= fromDate && o.CreatedAt <= toDate);

        var dealsQuery = _context.Deals
            .Where(d => d.TenantId == request.TenantId && d.CreatedAt >= fromDate && d.CreatedAt <= toDate && d.Status != DealStatus.Deleted);

        string? pipelineName = null;

        if (request.PipelineId.HasValue)
        {
            var pipeline = await _context.Pipelines
                .FirstOrDefaultAsync(p => p.Id == request.PipelineId.Value && p.TenantId == request.TenantId, cancellationToken);

            pipelineName = pipeline?.Name;
            opportunitiesQuery = opportunitiesQuery.Where(o => o.PipelineId == request.PipelineId.Value);
            dealsQuery = dealsQuery.Where(d => d.PipelineId == request.PipelineId.Value);
        }

        var opportunities = await opportunitiesQuery.ToListAsync(cancellationToken);
        var deals = await dealsQuery.ToListAsync(cancellationToken);

        var stages = await _context.PipelineStages
            .Where(s => s.TenantId == request.TenantId &&
                        (!request.PipelineId.HasValue || s.PipelineId == request.PipelineId.Value))
            .OrderBy(s => s.DisplayOrder)
            .ToListAsync(cancellationToken);

        var stageReports = stages.Select(s => new StageReportDto
        {
            StageId = s.Id,
            StageName = s.Name,
            ItemCount = opportunities.Count(o => o.StageId == s.Id) + deals.Count(d => d.StageId == s.Id),
            Value = opportunities.Where(o => o.StageId == s.Id).Sum(o => o.Amount.Amount) +
                    deals.Where(d => d.StageId == s.Id).Sum(d => d.Value.Amount),
            WeightedValue = opportunities.Where(o => o.StageId == s.Id).Sum(o => o.Amount.Amount * (o.Probability / 100)) +
                           deals.Where(d => d.StageId == s.Id).Sum(d => d.Value.Amount * (d.Probability / 100)),
            Probability = s.Probability
        }).ToList();

        return new PipelineReportDto
        {
            PipelineId = request.PipelineId,
            PipelineName = pipelineName,
            FromDate = fromDate,
            ToDate = toDate,
            TotalOpportunities = opportunities.Count,
            TotalDeals = deals.Count,
            TotalValue = opportunities.Sum(o => o.Amount.Amount) + deals.Sum(d => d.Value.Amount),
            WeightedValue = opportunities.Sum(o => o.Amount.Amount * (o.Probability / 100)) +
                           deals.Sum(d => d.Value.Amount * (d.Probability / 100)),
            StageReports = stageReports
        };
    }
}