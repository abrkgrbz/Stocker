namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Blog category for organizing posts
/// </summary>
public class BlogCategory : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<BlogPost> Posts { get; set; } = new List<BlogPost>();
}
