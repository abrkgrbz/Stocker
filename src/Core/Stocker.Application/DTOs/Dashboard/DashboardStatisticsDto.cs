namespace Stocker.Application.DTOs.Dashboard;

public class DashboardStatisticsDto
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int TrialSubscriptions { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal YearlyRevenue { get; set; }
    public int PendingInvoices { get; set; }
    public int OverdueInvoices { get; set; }
    public List<ActivityDto> RecentActivity { get; set; } = new();
}