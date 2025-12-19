using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetConversionRatesQuery : IRequest<ConversionRatesDto>
{
    public Guid? PipelineId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetConversionRatesQueryHandler : IRequestHandler<GetConversionRatesQuery, ConversionRatesDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetConversionRatesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ConversionRatesDto> Handle(GetConversionRatesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var dealsQuery = _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .Where(d => d.TenantId == tenantId && d.Status != DealStatus.Deleted);

        if (request.PipelineId.HasValue)
            dealsQuery = dealsQuery.Where(d => d.PipelineId == request.PipelineId.Value);

        if (request.FromDate.HasValue)
            dealsQuery = dealsQuery.Where(d => d.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            dealsQuery = dealsQuery.Where(d => d.CreatedAt <= request.ToDate.Value);

        var deals = await dealsQuery.ToListAsync(cancellationToken);
        var totalDeals = deals.Count;
        var wonDeals = deals.Count(d => d.Status == DealStatus.Won);
        var overallConversionRate = totalDeals > 0 ? (decimal)wonDeals / totalDeals * 100 : 0;

        string? pipelineName = null;
        var stageConversions = new List<StageConversionDto>();

        if (request.PipelineId.HasValue)
        {
            var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
                .Include(p => p.Stages)
                .FirstOrDefaultAsync(p => p.Id == request.PipelineId.Value && p.TenantId == tenantId, cancellationToken);

            if (pipeline != null)
            {
                pipelineName = pipeline.Name;
                var stages = pipeline.Stages.OrderBy(s => s.DisplayOrder).ToList();

                for (int i = 0; i < stages.Count - 1; i++)
                {
                    var fromStage = stages[i];
                    var toStage = stages[i + 1];

                    var dealsAtFromStage = deals.Count(d => d.StageId == fromStage.Id ||
                        stages.Skip(i + 1).Any(s => s.Id == d.StageId));
                    var dealsReachedToStage = deals.Count(d =>
                        stages.Skip(i + 1).Any(s => s.Id == d.StageId));

                    var conversionRate = dealsAtFromStage > 0
                        ? (decimal)dealsReachedToStage / dealsAtFromStage * 100
                        : 0;

                    stageConversions.Add(new StageConversionDto
                    {
                        FromStageId = fromStage.Id,
                        FromStageName = fromStage.Name,
                        ToStageId = toStage.Id,
                        ToStageName = toStage.Name,
                        ConversionRate = conversionRate,
                        ConvertedCount = dealsReachedToStage,
                        TotalCount = dealsAtFromStage
                    });
                }
            }
        }

        return new ConversionRatesDto
        {
            PipelineId = request.PipelineId,
            PipelineName = pipelineName,
            OverallConversionRate = overallConversionRate,
            StageConversions = stageConversions
        };
    }
}
