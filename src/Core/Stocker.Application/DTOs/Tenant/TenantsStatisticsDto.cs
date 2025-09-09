namespace Stocker.Application.DTOs.Tenant;

public class TenantsStatisticsDto
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int SuspendedTenants { get; set; }
    public int NewTenants { get; set; }
    public double MonthlyGrowth { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ExpiringTenants { get; set; }
    public int ExpiredTenants { get; set; }
    public List<PackageDistributionDto> PackageDistribution { get; set; } = new();
    public List<TopTenantDto> TopTenantsByUsers { get; set; } = new();
    public double AverageUsersPerTenant { get; set; }
    public int TotalUsers { get; set; }
}

public class PackageDistributionDto
{
    public string PackageName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class TopTenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public decimal Revenue { get; set; }
}