using MediatR;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Dashboard.Handlers;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IDashboardRepository _dashboardRepository;

    public GetDashboardSummaryQueryHandler(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var dbSummary = await _dashboardRepository.GetDashboardSummaryAsync(request.TenantId, cancellationToken);
        
        // Build the full summary DTO with additional mock data for now
        var result = new DashboardSummaryDto
        {
            Company = new CompanyInfoDto
            {
                Name = "Demo Company", // This would come from tenant/company service
                Logo = "/api/tenant/company/logo",
                Industry = "Technology",
                EmployeeCount = dbSummary.TotalUsers,
                FoundedYear = 2020
            },
            Subscription = new SubscriptionInfoDto
            {
                Plan = "Professional", // This would come from subscription service
                Status = "Active",
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                UsedStorage = 2.5,
                TotalStorage = 10,
                UsedUsers = dbSummary.ActiveUsers,
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
                TodayRevenue = dbSummary.TotalRevenue / 30, // Mock daily calculation
                TodayOrders = dbSummary.TotalInvoices / 30, // Mock daily calculation
                PendingTasks = dbSummary.PendingInvoices,
                UnreadMessages = 3 // This would come from notification service
            }
        };

        return result;
    }
}