namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Partner/client logo entity for social proof section
/// </summary>
public class Partner : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? LogoDark { get; set; } // For dark backgrounds
    public string? Url { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
}
