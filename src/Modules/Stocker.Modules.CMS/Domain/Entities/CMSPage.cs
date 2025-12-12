using Stocker.Modules.CMS.Domain.Enums;

namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Landing page entity for CMS management
/// </summary>
public class CMSPage : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaKeywords { get; set; }
    public string Content { get; set; } = string.Empty;
    public PageStatus Status { get; set; } = PageStatus.Draft;
    public int SortOrder { get; set; }
    public string? FeaturedImage { get; set; }
    public string? Template { get; set; }
    public DateTime? PublishedAt { get; set; }
}
