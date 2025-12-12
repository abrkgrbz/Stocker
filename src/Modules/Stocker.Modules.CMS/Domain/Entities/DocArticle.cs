namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Documentation article entity
/// </summary>
public class DocArticle : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Content { get; set; } // Markdown content
    public string? Icon { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsPopular { get; set; } // For popular articles section
    public int ViewCount { get; set; }

    // Foreign key
    public Guid CategoryId { get; set; }

    // Navigation
    public virtual DocCategory? Category { get; set; }
}
