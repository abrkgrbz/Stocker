namespace Stocker.Application.DTOs.Dashboard;

public class TopTenantDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public int UserCount { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public DateTime JoinedDate { get; set; }
}