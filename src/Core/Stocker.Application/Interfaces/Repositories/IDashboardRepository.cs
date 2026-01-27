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

    // Master Dashboard - Summary & KPIs
    Task<MasterDashboardSummaryDto> GetMasterDashboardSummaryAsync(CancellationToken cancellationToken = default);
    Task<MasterKeyMetricsDto> GetMasterKeyMetricsAsync(CancellationToken cancellationToken = default);
    Task<List<QuickActionDto>> GetQuickActionsAsync(CancellationToken cancellationToken = default);
    Task<AlertsSummaryDto> GetAlertsSummaryAsync(CancellationToken cancellationToken = default);
}

// Master Dashboard DTOs
public record MasterDashboardSummaryDto(
    int TotalTenants,
    int ActiveTenants,
    int TotalUsers,
    decimal MonthlyRevenue,
    decimal MrrGrowth,
    int NewTenantsThisMonth,
    int PendingInvoices,
    int ActiveAlerts,
    SystemHealthSummaryDto SystemHealth,
    List<RecentActivitySummaryDto> RecentActivities
);

public record SystemHealthSummaryDto(
    string OverallStatus,
    double CpuUsage,
    double MemoryUsage,
    double DiskUsage,
    long Uptime
);

public record RecentActivitySummaryDto(
    string Type,
    string Description,
    DateTime Timestamp,
    string? TenantName
);

public record MasterKeyMetricsDto(
    decimal Mrr,
    decimal Arr,
    decimal MrrGrowthPercent,
    int ChurnRate,
    decimal AverageRevenuePerUser,
    int CustomerLifetimeValue,
    decimal NetRevenueRetention,
    int TrialConversionRate
);

public record QuickActionDto(
    string Id,
    string Title,
    string Description,
    string ActionType,
    int Count,
    string? Url
);

public record AlertsSummaryDto(
    int TotalActive,
    int Critical,
    int Warning,
    int Info,
    List<AlertPreviewDto> RecentAlerts
);

public record AlertPreviewDto(
    string Id,
    string Title,
    string Severity,
    DateTime Timestamp
);