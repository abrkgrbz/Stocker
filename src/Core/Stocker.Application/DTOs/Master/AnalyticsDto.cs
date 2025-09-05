namespace Stocker.Application.DTOs.Master;

// Revenue Analytics
public class RevenueAnalyticsDto
{
    public string Period { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RecurringRevenue { get; set; }
    public decimal OneTimeRevenue { get; set; }
    public double GrowthRate { get; set; }
    public double ChurnRate { get; set; }
    public double AverageRevenuePerUser { get; set; }
    public List<PeriodRevenueDto> RevenueByPeriod { get; set; } = new();
    public List<PackageRevenueDto> RevenueByPackage { get; set; } = new();
    public List<TopTenantDto> TopPayingTenants { get; set; } = new();
}

public class PeriodRevenueDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public double Growth { get; set; }
}

public class PackageRevenueDto
{
    public string PackageName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public double Percentage { get; set; }
}

public class TopTenantDto
{
    public string TenantName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public string PackageName { get; set; } = string.Empty;
}

// User Analytics
public class UserAnalyticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int NewUsers { get; set; }
    public int ChurnedUsers { get; set; }
    public double ActivationRate { get; set; }
    public double RetentionRate { get; set; }
    public double AverageSessionDuration { get; set; }
    public List<UserGrowthDto> UserGrowth { get; set; } = new();
    public List<UserRoleDistribution> UsersByRole { get; set; } = new();
    public UserActivityMetrics UserActivity { get; set; } = new();
}

public class UserGrowthDto
{
    public string Period { get; set; } = string.Empty;
    public int TotalUsers { get; set; }
    public int NewUsers { get; set; }
    public int ChurnedUsers { get; set; }
}

public class UserRoleDistribution
{
    public string Role { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class UserActivityMetrics
{
    public int DailyActiveUsers { get; set; }
    public int WeeklyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    public double AverageLoginFrequency { get; set; }
}

// Subscription Analytics
public class SubscriptionAnalyticsDto
{
    public int TotalSubscriptions { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int TrialSubscriptions { get; set; }
    public int ExpiredSubscriptions { get; set; }
    public double ConversionRate { get; set; }
    public double UpgradeRate { get; set; }
    public double DowngradeRate { get; set; }
    public double AverageSubscriptionValue { get; set; }
    public List<SubscriptionStatusDto> SubscriptionsByStatus { get; set; } = new();
    public List<SubscriptionTrendDto> SubscriptionTrends { get; set; } = new();
    public ChurnPredictionDto ChurnPrediction { get; set; } = new();
}

public class SubscriptionStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class SubscriptionTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int NewSubscriptions { get; set; }
    public int Cancellations { get; set; }
    public int Upgrades { get; set; }
    public int Downgrades { get; set; }
}

public class ChurnPredictionDto
{
    public int HighRiskCount { get; set; }
    public int MediumRiskCount { get; set; }
    public int LowRiskCount { get; set; }
    public double PredictedChurnRate { get; set; }
}

// Performance Analytics
public class PerformanceAnalyticsDto
{
    public double AverageResponseTime { get; set; }
    public double P95ResponseTime { get; set; }
    public double P99ResponseTime { get; set; }
    public double RequestsPerSecond { get; set; }
    public double ErrorRate { get; set; }
    public double SuccessRate { get; set; }
    public long TotalRequests { get; set; }
    public long FailedRequests { get; set; }
    public List<ResponseTimeDto> ResponseTimeHistory { get; set; } = new();
    public List<EndpointMetricDto> EndpointPerformance { get; set; } = new();
    public SystemPerformanceMetrics SystemMetrics { get; set; } = new();
}

public class ResponseTimeDto
{
    public DateTime Timestamp { get; set; }
    public double AverageTime { get; set; }
    public double P95Time { get; set; }
    public double P99Time { get; set; }
}

public class EndpointMetricDto
{
    public string Endpoint { get; set; } = string.Empty;
    public double AverageTime { get; set; }
    public long CallCount { get; set; }
}

public class SystemPerformanceMetrics
{
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double DiskUsage { get; set; }
    public double NetworkLatency { get; set; }
}

// Usage Analytics
public class UsageAnalyticsDto
{
    public long TotalApiCalls { get; set; }
    public double AverageApiCallsPerTenant { get; set; }
    public double TotalStorageUsed { get; set; }
    public double AverageStoragePerTenant { get; set; }
    public double BandwidthUsed { get; set; }
    public List<FeatureUsageDto> FeatureUsage { get; set; } = new();
    public List<ModuleUsageDto> ModuleUsage { get; set; } = new();
    public List<PeakUsageDto> PeakUsageTimes { get; set; } = new();
}

public class FeatureUsageDto
{
    public string Feature { get; set; } = string.Empty;
    public long UsageCount { get; set; }
    public double Percentage { get; set; }
}

public class ModuleUsageDto
{
    public string Module { get; set; } = string.Empty;
    public int ActiveTenants { get; set; }
    public double UsagePercentage { get; set; }
}

public class PeakUsageDto
{
    public int Hour { get; set; }
    public string UsageLevel { get; set; } = string.Empty;
    public long RequestCount { get; set; }
}

// Growth Analytics
public class GrowthAnalyticsDto
{
    public double MonthlyGrowthRate { get; set; }
    public double YearlyGrowthRate { get; set; }
    public double UserGrowthRate { get; set; }
    public double RevenueGrowthRate { get; set; }
    public double TenantGrowthRate { get; set; }
    public decimal ProjectedMonthlyRevenue { get; set; }
    public decimal ProjectedYearlyRevenue { get; set; }
    public int ProjectedUserCount { get; set; }
    public int ProjectedTenantCount { get; set; }
    public List<GrowthTrendDto> GrowthTrends { get; set; } = new();
    public MarketPenetrationDto MarketPenetration { get; set; } = new();
}

public class GrowthTrendDto
{
    public string Category { get; set; } = string.Empty;
    public double CurrentValue { get; set; }
    public double PreviousValue { get; set; }
    public double GrowthRate { get; set; }
    public double Projection { get; set; }
}

public class MarketPenetrationDto
{
    public int TotalAddressableMarket { get; set; }
    public double CurrentMarketShare { get; set; }
    public double ProjectedMarketShare { get; set; }
    public List<CompetitorDto> CompetitorAnalysis { get; set; } = new();
}

public class CompetitorDto
{
    public string Name { get; set; } = string.Empty;
    public double MarketShare { get; set; }
}

// Custom Analytics
public class CustomAnalyticsRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string> Metrics { get; set; } = new();
    public Dictionary<string, object>? Filters { get; set; }
}

public class CustomAnalyticsResultDto
{
    public Guid QueryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string> Metrics { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
    public object? Data { get; set; }
    public List<ChartDataDto> Charts { get; set; } = new();
    public Dictionary<string, object> Summary { get; set; } = new();
}

public class ChartDataDto
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public object Data { get; set; } = new { };
}