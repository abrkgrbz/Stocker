namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Customer testimonial/review entity
/// </summary>
public class Testimonial : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Company { get; set; }
    public string Content { get; set; } = string.Empty;
    public int Rating { get; set; } = 5; // 1-5 star rating
    public string? Avatar { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
}
