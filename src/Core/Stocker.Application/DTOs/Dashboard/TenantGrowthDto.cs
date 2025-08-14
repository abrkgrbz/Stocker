namespace Stocker.Application.DTOs.Dashboard;

public class TenantGrowthDto
{
    public int CurrentMonthNewTenants { get; set; }
    public int LastMonthNewTenants { get; set; }
    public decimal GrowthRate { get; set; }
    public decimal ChurnRate { get; set; }
    public List<MonthlyGrowthDto> MonthlyGrowth { get; set; } = new();
}

public class MonthlyGrowthDto
{
    public string Month { get; set; } = string.Empty;
    public int NewTenants { get; set; }
    public int ChurnedTenants { get; set; }
    public int NetGrowth { get; set; }
}