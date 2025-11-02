namespace Stocker.Application.DTOs.Tenant;

public class TenantSubscriptionInfoDto
{
    public Guid SubscriptionId { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public string PackageType { get; set; } = string.Empty;
    public int CurrentUserCount { get; set; }
    public int MaxUsers { get; set; }
    public bool CanAddUser { get; set; }
    public int MaxStorage { get; set; } // GB
    public int MaxProjects { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CurrentPeriodEnd { get; set; }
    public bool IsTrialActive { get; set; }
    public DateTime? TrialEndDate { get; set; }
}
