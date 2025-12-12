namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Statistics entity for animated stats on landing/about pages
/// </summary>
public class Stat : CMSBaseEntity
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty; // e.g., "10000", "99.9"
    public string? Suffix { get; set; } // e.g., "+", "%", "/7"
    public string? Prefix { get; set; } // e.g., "$", "#"
    public string? Icon { get; set; }
    public string? Section { get; set; } // "landing", "about", "cta" etc.
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
