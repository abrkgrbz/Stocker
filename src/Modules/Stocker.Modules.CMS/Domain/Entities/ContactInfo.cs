namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Contact information entity including business hours
/// </summary>
public class ContactInfo : CMSBaseEntity
{
    public string Type { get; set; } = string.Empty; // "email", "phone", "address", "chat", "hours"
    public string Title { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public string? Href { get; set; } // mailto:, tel:, https:// etc.
    public string? AdditionalInfo { get; set; } // e.g., "7/24 Online" for chat
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
