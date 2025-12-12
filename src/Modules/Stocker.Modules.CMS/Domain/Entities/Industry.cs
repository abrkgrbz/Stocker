namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Industry/sector entity for landing page
/// </summary>
public class Industry : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Image { get; set; }
    public string? Color { get; set; } // Gradient or solid color
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
