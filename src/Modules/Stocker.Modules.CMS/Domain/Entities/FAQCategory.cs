namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// FAQ category for organizing questions
/// </summary>
public class FAQCategory : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<FAQItem> Items { get; set; } = new List<FAQItem>();
}
