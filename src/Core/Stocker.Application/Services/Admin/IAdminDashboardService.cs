using Stocker.SharedKernel.Results;

namespace Stocker.Application.Services.Admin;

/// <summary>
/// Service for admin dashboard operations
/// </summary>
public interface IAdminDashboardService
{
    /// <summary>
    /// Gets system-wide statistics
    /// </summary>
    Task<Result<SystemStatistics>> GetSystemStatisticsAsync();
    
    /// <summary>
    /// Gets tenant statistics for a specific tenant
    /// </summary>
    Task<Result<TenantStatistics>> GetTenantStatisticsAsync(Guid tenantId);
    
    /// <summary>
    /// Gets system health status
    /// </summary>
    Task<Result<SystemHealthStatus>> GetSystemHealthAsync();
    
    /// <summary>
    /// Gets recent system alerts
    /// </summary>
    Task<Result<IEnumerable<SystemAlert>>> GetRecentAlertsAsync(int count = 10);
}

/// <summary>
/// System-wide statistics
/// </summary>
public class SystemStatistics
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public long TotalProducts { get; set; }
    public long TotalTransactions { get; set; }
    public decimal TotalRevenue { get; set; }
    public Dictionary<string, int> UsersByRole { get; set; } = new();
    public Dictionary<string, int> TenantsByPackage { get; set; } = new();
    public SystemResourceUsage ResourceUsage { get; set; } = new();
}

/// <summary>
/// Tenant-specific statistics
/// </summary>
public class TenantStatistics
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = default!;
    public int UserCount { get; set; }
    public int ProductCount { get; set; }
    public int TransactionCount { get; set; }
    public decimal StorageUsedMB { get; set; }
    public DateTime LastActivityAt { get; set; }
    public Dictionary<string, object> CustomMetrics { get; set; } = new();
}

/// <summary>
/// System health status
/// </summary>
public class SystemHealthStatus
{
    public HealthLevel OverallHealth { get; set; }
    public Dictionary<string, ServiceHealth> Services { get; set; } = new();
    public SystemPerformanceMetrics Performance { get; set; } = new();
    public DateTime CheckedAt { get; set; }
}

/// <summary>
/// Service health status
/// </summary>
public class ServiceHealth
{
    public string ServiceName { get; set; } = default!;
    public HealthLevel Status { get; set; }
    public string? Message { get; set; }
    public TimeSpan ResponseTime { get; set; }
}

/// <summary>
/// System performance metrics
/// </summary>
public class SystemPerformanceMetrics
{
    public double CpuUsagePercent { get; set; }
    public double MemoryUsagePercent { get; set; }
    public double DiskUsagePercent { get; set; }
    public int ActiveConnections { get; set; }
    public double AverageResponseTimeMs { get; set; }
    public int RequestsPerSecond { get; set; }
}

/// <summary>
/// System resource usage
/// </summary>
public class SystemResourceUsage
{
    public long TotalStorageGB { get; set; }
    public long UsedStorageGB { get; set; }
    public int DatabaseConnections { get; set; }
    public int ApiCallsToday { get; set; }
    public int ApiCallsThisMonth { get; set; }
}

/// <summary>
/// System alert
/// </summary>
public class SystemAlert
{
    public Guid Id { get; set; }
    public AlertLevel Level { get; set; }
    public string Category { get; set; } = default!;
    public string Message { get; set; } = default!;
    public DateTime OccurredAt { get; set; }
    public bool IsResolved { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

/// <summary>
/// Health level enumeration
/// </summary>
public enum HealthLevel
{
    Healthy,
    Warning,
    Critical,
    Unknown
}

/// <summary>
/// Alert level enumeration
/// </summary>
public enum AlertLevel
{
    Info,
    Warning,
    Error,
    Critical
}