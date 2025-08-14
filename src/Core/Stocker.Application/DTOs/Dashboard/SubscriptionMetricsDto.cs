namespace Stocker.Application.DTOs.Dashboard;

public class SubscriptionMetricsDto
{
    public int TotalSubscriptions { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int TrialSubscriptions { get; set; }
    public int CancelledSubscriptions { get; set; }
    public int SuspendedSubscriptions { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal AverageSubscriptionValue { get; set; }
    public List<PackageSubscriptionDto> SubscriptionsByPackage { get; set; } = new();
    public List<UpcomingRenewalDto> UpcomingRenewals { get; set; } = new();
}

public class PackageSubscriptionDto
{
    public string PackageName { get; set; } = string.Empty;
    public int ActiveCount { get; set; }
    public int TrialCount { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class UpcomingRenewalDto
{
    public Guid SubscriptionId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public DateTime RenewalDate { get; set; }
    public decimal Amount { get; set; }
}