using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    public Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        // Mock data for now - will be replaced when modules are ready
        var result = new DashboardStatsDto
        {
            TotalRevenue = 125750.50m,
            TotalOrders = 342,
            TotalCustomers = 89,
            TotalProducts = 156,
            RevenueGrowth = 15.5,
            OrderGrowth = 8.2,
            CustomerGrowth = 12.3,
            ProductGrowth = 5.1,
            MonthlyRevenue = new List<MonthlyRevenueDto>
            {
                new() { Month = "Ocak", Revenue = 95000 },
                new() { Month = "Şubat", Revenue = 105000 },
                new() { Month = "Mart", Revenue = 125750.50m }
            },
            TopProducts = new List<TopProductDto>
            {
                new() { Name = "Laptop", Sales = 45, Revenue = 67500 },
                new() { Name = "Mouse", Sales = 120, Revenue = 3600 },
                new() { Name = "Klavye", Sales = 80, Revenue = 8000 }
            },
            RecentOrders = new List<RecentOrderDto>
            {
                new() { Id = Guid.NewGuid(), OrderNumber = "ORD-2024-001", Customer = "ABC Şirketi", Amount = 2500, Status = "Completed" },
                new() { Id = Guid.NewGuid(), OrderNumber = "ORD-2024-002", Customer = "XYZ Ltd.", Amount = 1800, Status = "Processing" },
                new() { Id = Guid.NewGuid(), OrderNumber = "ORD-2024-003", Customer = "Test AŞ", Amount = 3200, Status = "Pending" }
            }
        };

        return Task.FromResult(result);
    }
}