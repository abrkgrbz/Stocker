using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetSalesForecastQuery : IRequest<ForecastDto>
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetSalesForecastQueryHandler : IRequestHandler<GetSalesForecastQuery, ForecastDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetSalesForecastQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ForecastDto> Handle(GetSalesForecastQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunities = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Where(o => o.TenantId == tenantId &&
                        o.Status == OpportunityStatus.Open &&
                        o.ExpectedCloseDate >= request.FromDate &&
                        o.ExpectedCloseDate <= request.ToDate)
            .ToListAsync(cancellationToken);

        var bestCase = opportunities.Sum(o => o.Amount.Amount);
        var weighted = opportunities.Sum(o => o.Amount.Amount * (o.Probability / 100));
        var worstCase = opportunities
            .Where(o => o.Probability >= 70)
            .Sum(o => o.Amount.Amount * (o.Probability / 100));
        var mostLikely = opportunities
            .Where(o => o.Probability >= 50)
            .Sum(o => o.Amount.Amount * (o.Probability / 100));

        var monthlyForecasts = opportunities
            .GroupBy(o => o.ExpectedCloseDate.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new MonthlyForecastDto
            {
                Month = g.Key,
                BestCase = g.Sum(o => o.Amount.Amount),
                MostLikely = g.Where(o => o.Probability >= 50).Sum(o => o.Amount.Amount * (o.Probability / 100)),
                WorstCase = g.Where(o => o.Probability >= 70).Sum(o => o.Amount.Amount * (o.Probability / 100)),
                Weighted = g.Sum(o => o.Amount.Amount * (o.Probability / 100))
            })
            .ToList();

        return new ForecastDto
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            BestCase = bestCase,
            MostLikely = mostLikely,
            WorstCase = worstCase,
            WeightedForecast = weighted,
            MonthlyForecasts = monthlyForecasts
        };
    }
}