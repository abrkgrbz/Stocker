using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    public Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        // Mock data for now - will be replaced when modules are ready
        var result = new DashboardSummaryDto
        {
            Company = new CompanyInfoDto
            {
                Name = "Demo Company",
                Logo = "/api/tenant/company/logo",
                Industry = "Technology",
                EmployeeCount = 50,
                FoundedYear = 2020
            },
            Subscription = new SubscriptionInfoDto
            {
                Plan = "Professional",
                Status = "Active",
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                UsedStorage = 2.5,
                TotalStorage = 10,
                UsedUsers = 15,
                TotalUsers = 50
            },
            Modules = new List<ModuleInfoDto>
            {
                new() { Name = "CRM", Status = "Active", UsagePercentage = 65 },
                new() { Name = "Inventory", Status = "Active", UsagePercentage = 45 },
                new() { Name = "Finance", Status = "Active", UsagePercentage = 80 },
                new() { Name = "HR", Status = "Inactive", UsagePercentage = 0 }
            },
            QuickStats = new QuickStatsDto
            {
                TodayRevenue = 15750.50m,
                TodayOrders = 24,
                PendingTasks = 8,
                UnreadMessages = 3
            }
        };

        return Task.FromResult(result);
    }
}