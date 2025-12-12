namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Achievement/badge entity for social proof section
/// </summary>
public class Achievement : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty; // e.g., "4.9/5", "#1", "ISO 27001"
    public string? Icon { get; set; }
    public string? IconColor { get; set; } // e.g., "text-yellow-400"
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
