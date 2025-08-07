namespace Stocker.Application.DTOs.Tenant;

public class TenantListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? ContactEmail { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public int UserCount { get; set; }
}