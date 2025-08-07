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