namespace Stocker.Application.DTOs.Tenant;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public TenantSubscriptionDto? Subscription { get; set; }
}

public class TenantSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid? PackageId { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public decimal Price { get; set; }
}

 