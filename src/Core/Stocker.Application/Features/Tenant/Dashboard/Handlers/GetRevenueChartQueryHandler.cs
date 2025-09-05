using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetRevenueChartQueryHandler : IRequestHandler<GetRevenueChartQuery, RevenueChartDto>
{
    private readonly TenantDbContext _context;

    public GetRevenueChartQueryHandler(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<RevenueChartDto> Handle(GetRevenueChartQuery request, CancellationToken cancellationToken)
    {
        var tenantId = request.TenantId;
        var period = request.Period;
        var today = DateTime.UtcNow.Date;
        DateTime startDate;
        List<string> labels;

        if (period == "weekly")
        {
            startDate = today.AddDays(-7);
            labels = new List<string>();
            for (int i = 6; i >= 0; i--)
            {
                labels.Add(today.AddDays(-i).ToString("dd/MM"));
            }
        }
        else if (period == "yearly")
        {
            startDate = today.AddYears(-1);
            var monthNames = new[] { "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" };
            labels = new List<string>();
            for (int i = 11; i >= 0; i--)
            {
                var month = today.AddMonths(-i);
                labels.Add(monthNames[month.Month - 1]);
            }
        }
        else
        {
            startDate = today.AddMonths(-6);
            var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };
            labels = new List<string>();
            for (int i = 5; i >= 0; i--)
            {
                var month = today.AddMonths(-i);
                labels.Add(monthNames[month.Month]);
            }
        }

        var revenueQuery = _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" && o.CreatedDate >= startDate);

        var revenueData = new List<decimal>();
        var expenseData = new List<decimal>();

        if (period == "weekly")
        {
            for (int i = 6; i >= 0; i--)
            {
                var dayStart = today.AddDays(-i);
                var dayEnd = dayStart.AddDays(1);
                var dayRevenue = await revenueQuery
                    .Where(o => o.CreatedDate >= dayStart && o.CreatedDate < dayEnd)
                    .SumAsync(o => o.TotalAmount, cancellationToken);
                revenueData.Add(dayRevenue);

                var dayExpense = await _context.Expenses
                    .Where(e => e.TenantId == tenantId && !e.IsDeleted && e.Date >= dayStart && e.Date < dayEnd)
                    .SumAsync(e => e.Amount, cancellationToken);
                expenseData.Add(dayExpense);
            }
        }
        else if (period == "yearly")
        {
            for (int i = 11; i >= 0; i--)
            {
                var monthStart = new DateTime(today.AddMonths(-i).Year, today.AddMonths(-i).Month, 1);
                var monthEnd = monthStart.AddMonths(1);
                var monthRevenue = await revenueQuery
                    .Where(o => o.CreatedDate >= monthStart && o.CreatedDate < monthEnd)
                    .SumAsync(o => o.TotalAmount, cancellationToken);
                revenueData.Add(monthRevenue);

                var monthExpense = await _context.Expenses
                    .Where(e => e.TenantId == tenantId && !e.IsDeleted && e.Date >= monthStart && e.Date < monthEnd)
                    .SumAsync(e => e.Amount, cancellationToken);
                expenseData.Add(monthExpense);
            }
        }
        else
        {
            for (int i = 5; i >= 0; i--)
            {
                var monthStart = new DateTime(today.AddMonths(-i).Year, today.AddMonths(-i).Month, 1);
                var monthEnd = monthStart.AddMonths(1);
                var monthRevenue = await revenueQuery
                    .Where(o => o.CreatedDate >= monthStart && o.CreatedDate < monthEnd)
                    .SumAsync(o => o.TotalAmount, cancellationToken);
                revenueData.Add(monthRevenue);

                var monthExpense = await _context.Expenses
                    .Where(e => e.TenantId == tenantId && !e.IsDeleted && e.Date >= monthStart && e.Date < monthEnd)
                    .SumAsync(e => e.Amount, cancellationToken);
                expenseData.Add(monthExpense);
            }
        }

        return new RevenueChartDto
        {
            Labels = labels.ToArray(),
            Datasets = new List<ChartDatasetDto>
            {
                new ChartDatasetDto
                {
                    Label = "Gelir",
                    Data = revenueData.ToArray(),
                    BorderColor = "#1890ff",
                    BackgroundColor = "rgba(24, 144, 255, 0.1)"
                },
                new ChartDatasetDto
                {
                    Label = "Gider",
                    Data = expenseData.ToArray(),
                    BorderColor = "#ff4d4f",
                    BackgroundColor = "rgba(255, 77, 79, 0.1)"
                }
            }
        };
    }
}