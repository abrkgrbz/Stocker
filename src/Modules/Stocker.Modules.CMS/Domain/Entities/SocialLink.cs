namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Social media link entity for footer
/// </summary>
public class SocialLink : CMSBaseEntity
{
    public string Platform { get; set; } = string.Empty; // "twitter", "facebook", "linkedin", etc.
    public string Url { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Label { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
