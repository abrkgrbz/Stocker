using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelineStatisticsQuery : IRequest<PipelineStatisticsDto>
{
    public Guid PipelineId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetPipelineStatisticsQueryHandler : IRequestHandler<GetPipelineStatisticsQuery, PipelineStatisticsDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetPipelineStatisticsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PipelineStatisticsDto> Handle(GetPipelineStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.PipelineId && p.TenantId == tenantId, cancellationToken);

        if (pipeline == null)
            return new PipelineStatisticsDto { PipelineId = request.PipelineId };

        var opportunities = await _unitOfWork.ReadRepository<Opportunity>().AsQueryable()
            .Where(o => o.PipelineId == request.PipelineId && o.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var openOpportunities = opportunities.Where(o => o.Status == OpportunityStatus.Open).ToList();
        var wonOpportunities = opportunities.Where(o => o.Status == OpportunityStatus.Won).ToList();
        var lostOpportunities = opportunities.Where(o => o.Status == OpportunityStatus.Lost).ToList();

        var stageStats = pipeline.Stages.Select(s =>
        {
            var stageOpportunities = openOpportunities.Where(o => o.StageId == s.Id).ToList();
            return new StageStatisticsDto
            {
                StageId = s.Id,
                StageName = s.Name,
                DisplayOrder = s.DisplayOrder,
                OpportunityCount = stageOpportunities.Count,
                TotalValue = stageOpportunities.Sum(o => o.Amount.Amount),
                WeightedValue = stageOpportunities.Sum(o => o.CalculateWeightedValue()),
                AverageDaysInStage = stageOpportunities.Any()
                    ? stageOpportunities.Average(o => o.GetDaysInCurrentStage())
                    : 0
            };
        }).OrderBy(s => s.DisplayOrder).ToList();

        var totalClosedCount = wonOpportunities.Count + lostOpportunities.Count;
        var conversionRate = totalClosedCount > 0 ? (decimal)wonOpportunities.Count / totalClosedCount * 100 : 0;

        return new PipelineStatisticsDto
        {
            PipelineId = pipeline.Id,
            PipelineName = pipeline.Name,
            TotalOpportunities = opportunities.Count,
            OpenOpportunities = openOpportunities.Count,
            WonOpportunities = wonOpportunities.Count,
            LostOpportunities = lostOpportunities.Count,
            TotalValue = openOpportunities.Sum(o => o.Amount.Amount),
            WeightedValue = openOpportunities.Sum(o => o.CalculateWeightedValue()),
            WonValue = wonOpportunities.Sum(o => o.Amount.Amount),
            LostValue = lostOpportunities.Sum(o => o.Amount.Amount),
            ConversionRate = conversionRate,
            StageStatistics = stageStats
        };
    }
}
