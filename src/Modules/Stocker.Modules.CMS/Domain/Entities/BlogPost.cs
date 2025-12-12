using Stocker.Modules.CMS.Domain.Enums;

namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Blog post entity
/// </summary>
public class BlogPost : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? FeaturedImage { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public int ViewCount { get; set; }
    public string? ReadTime { get; set; }
    public string? Author { get; set; }
    public string? Tags { get; set; } // Comma-separated tags

    // Foreign key
    public Guid? CategoryId { get; set; }

    // Navigation
    public virtual BlogCategory? Category { get; set; }
}
