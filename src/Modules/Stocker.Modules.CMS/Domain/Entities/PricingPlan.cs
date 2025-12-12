namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Pricing plan entity for landing page
/// </summary>
public class PricingPlan : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "TRY";
    public string BillingPeriod { get; set; } = "monthly"; // monthly, yearly
    public decimal? OriginalPrice { get; set; } // For discounts
    public string? Badge { get; set; } // "En Popüler", "Yeni" etc.
    public string? ButtonText { get; set; }
    public string? ButtonUrl { get; set; }
    public bool IsPopular { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // Navigation
    public virtual ICollection<PricingFeature> Features { get; set; } = new List<PricingFeature>();
}
