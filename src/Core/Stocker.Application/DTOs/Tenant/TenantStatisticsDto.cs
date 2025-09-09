namespace Stocker.Application.DTOs.Tenant;

public class TenantStatisticsDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    
    // User Statistics
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int InactiveUsers { get; set; }
    
    // Product Statistics
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    
    // Stock Statistics
    public decimal TotalStockValue { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
    
    // Activity Statistics
    public DateTime? LastLoginDate { get; set; }
    public DateTime? LastActivityDate { get; set; }
    
    // Subscription Information
    public string PackageName { get; set; } = string.Empty;
    public string SubscriptionStatus { get; set; } = string.Empty;
    public DateTime? SubscriptionEndDate { get; set; }
    
    // Storage Information
    public long StorageUsedBytes { get; set; }
    public long StorageLimitBytes { get; set; }
    public string StorageUsedFormatted => FormatBytes(StorageUsedBytes);
    public string StorageLimitFormatted => FormatBytes(StorageLimitBytes);
    public decimal StorageUsagePercentage => StorageLimitBytes > 0 
        ? Math.Round((decimal)StorageUsedBytes / StorageLimitBytes * 100, 2) 
        : 0;
    
    // Dashboard Metrics
    public UserMetrics Users { get; set; } = new();
    public StorageMetrics Storage { get; set; } = new();
    public BillingMetrics Billing { get; set; } = new();
    public ActivityMetrics Activity { get; set; } = new();
    public ModuleMetrics Modules { get; set; } = new();
    public HealthMetrics Health { get; set; } = new();
    
    private static string FormatBytes(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double size = bytes;
        
        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }
        
        return $"{size:0.##} {sizes[order]}";
    }
}

public class UserMetrics
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Inactive { get; set; }
    public decimal Growth { get; set; }
}

public class StorageMetrics
{
    public long Used { get; set; }
    public long Total { get; set; }
    public decimal Percentage { get; set; }
}

public class BillingMetrics
{
    public string CurrentPlan { get; set; } = string.Empty;
    public decimal MonthlyRevenue { get; set; }
    public string NextBillingDate { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
}

public class ActivityMetrics
{
    public int DailyActiveUsers { get; set; }
    public int WeeklyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    public string LastActivity { get; set; } = string.Empty;
}

public class ModuleMetrics
{
    public int Total { get; set; }
    public int Active { get; set; }
    public List<string> Names { get; set; } = new();
}

public class HealthMetrics
{
    public string Status { get; set; } = "healthy";
    public decimal Uptime { get; set; }
    public string? LastIncident { get; set; }
    public int ApiLatency { get; set; }
}