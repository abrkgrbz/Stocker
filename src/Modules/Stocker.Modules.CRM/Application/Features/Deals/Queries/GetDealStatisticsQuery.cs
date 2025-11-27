using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealStatisticsQuery : IRequest<DealStatisticsDto>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

public class GetDealStatisticsQueryHandler : IRequestHandler<GetDealStatisticsQuery, DealStatisticsDto>
{
    private readonly CRMDbContext _context;

    public GetDealStatisticsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<DealStatisticsDto> Handle(GetDealStatisticsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Deals
            .Where(d => d.TenantId == request.TenantId && d.Status != DealStatus.Deleted);

        if (request.FromDate.HasValue)
            query = query.Where(d => d.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(d => d.CreatedAt <= request.ToDate.Value);

        var deals = await query.ToListAsync(cancellationToken);

        var totalDeals = deals.Count;
        var openDeals = deals.Count(d => d.Status == DealStatus.Open);
        var wonDeals = deals.Count(d => d.Status == DealStatus.Won);
        var lostDeals = deals.Count(d => d.Status == DealStatus.Lost);
        var totalValue = deals.Sum(d => d.Value.Amount);
        var averageValue = totalDeals > 0 ? totalValue / totalDeals : 0;
        var closedDeals = wonDeals + lostDeals;
        var winRate = closedDeals > 0 ? (decimal)wonDeals / closedDeals * 100 : 0;

        var wonDealsWithCloseDate = deals.Where(d => d.Status == DealStatus.Won && d.ActualCloseDate.HasValue).ToList();
        var averageSalesCycle = wonDealsWithCloseDate.Count > 0
            ? (decimal)wonDealsWithCloseDate.Average(d => (d.ActualCloseDate!.Value - d.CreatedAt).TotalDays)
            : 0;

        var dealsByStatus = deals
            .GroupBy(d => d.Status.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var valueByStatus = deals
            .GroupBy(d => d.Status.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(d => d.Value.Amount));

        var monthlyDeals = deals
            .GroupBy(d => d.CreatedAt.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new MonthlyDealDto
            {
                Month = g.Key,
                Count = g.Count(),
                Value = g.Sum(d => d.Value.Amount)
            })
            .ToList();

        return new DealStatisticsDto
        {
            TotalDeals = totalDeals,
            OpenDeals = openDeals,
            WonDeals = wonDeals,
            LostDeals = lostDeals,
            TotalValue = totalValue,
            AverageValue = averageValue,
            WinRate = winRate,
            AverageSalesCycle = averageSalesCycle,
            DealsByStatus = dealsByStatus,
            ValueByStatus = valueByStatus,
            MonthlyDeals = monthlyDeals
        };
    }
}