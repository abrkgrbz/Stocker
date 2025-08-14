using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Dashboard;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Features.Dashboard.Queries.GetRevenueReport;

public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, RevenueReportDto>
{
    private readonly IMasterUnitOfWork _unitOfWork;

    public GetRevenueReportQueryHandler(IMasterUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RevenueReportDto> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddMonths(-1);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        // Get all active subscriptions within date range
        var subscriptionRepo = _unitOfWork.Repository<Domain.Master.Entities.Subscription>();
        var subscriptions = await subscriptionRepo.AsQueryable()
            .Include(s => s.Package)
            .Include(s => s.Tenant)
            .Where(s => s.Status == SubscriptionStatus.Active &&
                       s.CurrentPeriodStart >= fromDate &&
                       s.CurrentPeriodStart <= toDate)
            .ToListAsync(cancellationToken);

        // Calculate total revenue using Price.Amount
        var totalRevenue = subscriptions.Sum(s => s.Price?.Amount ?? 0);

        // TODO: Calculate refunds when Payment entity is fully implemented
        var totalRefunds = 0m;
        var netRevenue = totalRevenue - totalRefunds;

        // Calculate daily revenue
        var dailyRevenue = subscriptions
            .GroupBy(s => s.CurrentPeriodStart.Date)
            .Select(g => new DailyRevenueDto
            {
                Date = g.Key,
                Revenue = g.Sum(s => s.Price?.Amount ?? 0),
                TransactionCount = g.Count()
            })
            .OrderBy(d => d.Date)
            .ToList();

        // Fill missing dates with zero revenue
        var allDates = new List<DailyRevenueDto>();
        for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
        {
            var existing = dailyRevenue.FirstOrDefault(d => d.Date == date);
            if (existing != null)
            {
                allDates.Add(existing);
            }
            else
            {
                allDates.Add(new DailyRevenueDto
                {
                    Date = date,
                    Revenue = 0,
                    TransactionCount = 0
                });
            }
        }

        // Calculate revenue by package
        var revenueByPackage = subscriptions
            .GroupBy(s => s.Package?.Name ?? "Unknown")
            .Select(g => new PackageRevenueDto
            {
                PackageName = g.Key,
                Revenue = g.Sum(s => s.Price?.Amount ?? 0),
                SubscriptionCount = g.Count()
            })
            .OrderByDescending(p => p.Revenue)
            .ToList();

        return new RevenueReportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            TotalRevenue = totalRevenue,
            TotalRefunds = totalRefunds,
            NetRevenue = netRevenue,
            DailyRevenue = allDates,
            RevenueByPackage = revenueByPackage
        };
    }
}