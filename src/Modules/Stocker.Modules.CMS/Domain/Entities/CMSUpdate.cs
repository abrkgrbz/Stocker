namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Changelog/Update entry
/// </summary>
public class CMSUpdate : CMSBaseEntity
{
    public string Version { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime ReleaseDate { get; set; }
    public string Type { get; set; } = "feature"; // feature, bugfix, improvement, security
    public bool IsPublished { get; set; }
}
