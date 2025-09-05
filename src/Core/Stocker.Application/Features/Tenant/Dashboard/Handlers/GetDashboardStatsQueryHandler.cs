using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly TenantDbContext _context;

    public GetDashboardStatsQueryHandler(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = request.TenantId;
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);
        var startOfLastMonth = startOfMonth.AddMonths(-1);
        var sixMonthsAgo = today.AddMonths(-6);

        var totalCustomers = await _context.Customers
            .Where(c => c.TenantId == tenantId && !c.IsDeleted)
            .CountAsync(cancellationToken);

        var totalProducts = await _context.Products
            .Where(p => p.TenantId == tenantId && !p.IsDeleted)
            .CountAsync(cancellationToken);

        var totalOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted)
            .CountAsync(cancellationToken);

        var totalRevenue = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed")
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var lastMonthCustomers = await _context.Customers
            .Where(c => c.TenantId == tenantId && !c.IsDeleted && c.CreatedDate < startOfMonth && c.CreatedDate >= startOfLastMonth)
            .CountAsync(cancellationToken);

        var thisMonthCustomers = await _context.Customers
            .Where(c => c.TenantId == tenantId && !c.IsDeleted && c.CreatedDate >= startOfMonth)
            .CountAsync(cancellationToken);

        var customerGrowth = lastMonthCustomers > 0
            ? Math.Round(((double)(thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100, 1)
            : 0;

        var lastMonthOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.CreatedDate < startOfMonth && o.CreatedDate >= startOfLastMonth)
            .CountAsync(cancellationToken);

        var thisMonthOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.CreatedDate >= startOfMonth)
            .CountAsync(cancellationToken);

        var orderGrowth = lastMonthOrders > 0
            ? Math.Round(((double)(thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100, 1)
            : 0;

        var lastMonthRevenue = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed"
                && o.CreatedDate < startOfMonth && o.CreatedDate >= startOfLastMonth)
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var thisMonthRevenue = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" && o.CreatedDate >= startOfMonth)
            .SumAsync(o => o.TotalAmount, cancellationToken);

        var revenueGrowth = lastMonthRevenue > 0
            ? Math.Round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100, 1)
            : 0;

        var monthlyRevenue = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted && o.Status == "Completed" && o.CreatedDate >= sixMonthsAgo)
            .GroupBy(o => new { o.CreatedDate.Year, o.CreatedDate.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync(cancellationToken);

        var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };
        var monthlyRevenueData = monthlyRevenue.Select(m => new MonthlyRevenueDto
        {
            Month = monthNames[m.Month],
            Revenue = m.Revenue
        }).ToList();

        var topProducts = await _context.OrderItems
            .Where(oi => oi.Order.TenantId == tenantId && !oi.Order.IsDeleted && oi.Order.Status == "Completed")
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
            .Select(g => new TopProductDto
            {
                Name = g.Key.Name,
                Sales = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(3)
            .ToListAsync(cancellationToken);

        var recentOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedDate)
            .Take(3)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Customer = o.Customer.Name,
                Amount = o.TotalAmount,
                Status = o.Status
            })
            .ToListAsync(cancellationToken);

        return new DashboardStatsDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            TotalCustomers = totalCustomers,
            TotalProducts = totalProducts,
            RevenueGrowth = revenueGrowth,
            OrderGrowth = orderGrowth,
            CustomerGrowth = customerGrowth,
            ProductGrowth = 0.0,
            MonthlyRevenue = monthlyRevenueData,
            TopProducts = topProducts,
            RecentOrders = recentOrders
        };
    }
}