namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Documentation category entity
/// </summary>
public class DocCategory : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; } // Gradient e.g., "from-emerald-500 to-teal-500"
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<DocArticle> Articles { get; set; } = new List<DocArticle>();
}
