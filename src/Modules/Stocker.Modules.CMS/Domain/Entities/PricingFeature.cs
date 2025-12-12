namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Feature item for pricing plans
/// </summary>
public class PricingFeature : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsIncluded { get; set; } = true;
    public string? Value { get; set; } // e.g., "10 users", "Unlimited"
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Foreign key
    public Guid PlanId { get; set; }

    // Navigation
    public virtual PricingPlan? Plan { get; set; }
}
