namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Product feature entity for landing page features section
/// </summary>
public class Feature : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; } // Icon name or SVG
    public string? IconColor { get; set; }
    public string? Image { get; set; }
    public string? Category { get; set; } // Group features by category
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
}
