namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// CMS setting key-value pair
/// </summary>
public class CMSSetting : CMSBaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Group { get; set; } = "general";
    public string? Description { get; set; }
}
