using Stocker.Application.DTOs.Tenant.Dashboard;

namespace Stocker.Application.Interfaces.Repositories;

public interface IDashboardRepository
{
    // Tenant Dashboard
    Task<DashboardStatsDto> GetTenantDashboardStatsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<ActivityDto>> GetRecentActivitiesAsync(Guid tenantId, int count = 10, CancellationToken cancellationToken = default);
    Task<List<NotificationDto>> GetNotificationsAsync(Guid tenantId, string userId, CancellationToken cancellationToken = default);
    Task<RevenueChartDto> GetRevenueChartDataAsync(Guid tenantId, string period, CancellationToken cancellationToken = default);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid tenantId, CancellationToken cancellationToken = default);
    
    // Master Dashboard
    Task<object> GetMasterDashboardStatsAsync(CancellationToken cancellationToken = default);
    Task<object> GetRevenueOverviewAsync(CancellationToken cancellationToken = default);
    Task<object> GetTenantStatsAsync(CancellationToken cancellationToken = default);
    Task<object> GetSystemHealthAsync(CancellationToken cancellationToken = default);
    Task<List<object>> GetRecentTenantsAsync(int count = 10, CancellationToken cancellationToken = default);
    Task<List<object>> GetRecentUsersAsync(int count = 10, CancellationToken cancellationToken = default);
}