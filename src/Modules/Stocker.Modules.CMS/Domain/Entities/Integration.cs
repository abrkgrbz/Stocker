namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Integration category entity for landing page
/// </summary>
public class Integration : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<IntegrationItem> Items { get; set; } = new List<IntegrationItem>();
}
