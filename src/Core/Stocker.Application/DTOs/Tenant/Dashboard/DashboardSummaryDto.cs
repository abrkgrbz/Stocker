namespace Stocker.Application.DTOs.Tenant.Dashboard;

public class DashboardSummaryDto
{
    public CompanyInfoDto Company { get; set; } = new();
    public SubscriptionInfoDto Subscription { get; set; } = new();
    public List<ModuleInfoDto> Modules { get; set; } = new();
    public QuickStatsDto QuickStats { get; set; } = new();
    
    // Additional fields for database integration
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalInvoices { get; set; }
    public int PendingInvoices { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal OutstandingAmount { get; set; }
}

public class CompanyInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public int EmployeeCount { get; set; }
    public int FoundedYear { get; set; }
}

public class SubscriptionInfoDto
{
    public string Plan { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public double UsedStorage { get; set; }
    public int TotalStorage { get; set; }
    public int UsedUsers { get; set; }
    public int TotalUsers { get; set; }
}

public class ModuleInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int UsagePercentage { get; set; }
}

public class QuickStatsDto
{
    public decimal TodayRevenue { get; set; }
    public int TodayOrders { get; set; }
    public int PendingTasks { get; set; }
    public int UnreadMessages { get; set; }
}