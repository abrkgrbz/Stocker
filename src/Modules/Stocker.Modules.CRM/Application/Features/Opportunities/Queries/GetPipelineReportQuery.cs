using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetPipelineReportQuery : IRequest<PipelineReportDto>
{
    public Guid? PipelineId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetPipelineReportQueryHandler : IRequestHandler<GetPipelineReportQuery, PipelineReportDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetPipelineReportQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PipelineReportDto> Handle(GetPipelineReportQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddMonths(-12);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        var opportunitiesQuery = _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Where(o => o.TenantId == tenantId && o.CreatedAt >= fromDate && o.CreatedAt <= toDate);

        var dealsQuery = _unitOfWork.ReadRepository<Domain.Entities.Deal>().AsQueryable()
            .Where(d => d.TenantId == tenantId && d.CreatedAt >= fromDate && d.CreatedAt <= toDate && d.Status != DealStatus.Deleted);

        string? pipelineName = null;

        if (request.PipelineId.HasValue)
        {
            var pipeline = await _unitOfWork.ReadRepository<Domain.Entities.Pipeline>().AsQueryable()
                .FirstOrDefaultAsync(p => p.Id == request.PipelineId.Value && p.TenantId == tenantId, cancellationToken);

            pipelineName = pipeline?.Name;
            opportunitiesQuery = opportunitiesQuery.Where(o => o.PipelineId == request.PipelineId.Value);
            dealsQuery = dealsQuery.Where(d => d.PipelineId == request.PipelineId.Value);
        }

        var opportunities = await opportunitiesQuery.ToListAsync(cancellationToken);
        var deals = await dealsQuery.ToListAsync(cancellationToken);

        var stages = await _unitOfWork.ReadRepository<Domain.Entities.PipelineStage>().AsQueryable()
            .Where(s => s.TenantId == tenantId &&
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