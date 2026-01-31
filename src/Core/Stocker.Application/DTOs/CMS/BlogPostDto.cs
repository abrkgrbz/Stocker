using Stocker.Domain.Master.Enums.CMS;

namespace Stocker.Application.DTOs.CMS;

/// <summary>
/// Blog yazısı detay DTO'su
/// </summary>
public class BlogPostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public BlogCategoryDto Category { get; set; } = null!;
    public List<string> Tags { get; set; } = new();
    public PostStatus Status { get; set; }
    public string StatusText => Status.ToString().ToLowerInvariant();
    public DateTime? PublishDate { get; set; }
    public string? FeaturedImage { get; set; }
    public AuthorDto Author { get; set; } = null!;
    public long Views { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Blog yazısı liste DTO'su
/// </summary>
public class BlogPostListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public PostStatus Status { get; set; }
    public string StatusText => Status.ToString().ToLowerInvariant();
    public DateTime? PublishDate { get; set; }
    public string? FeaturedImage { get; set; }
    public AuthorDto Author { get; set; } = null!;
    public long Views { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Blog kategori DTO'su
/// </summary>
public class BlogCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int PostCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Blog kategori liste DTO'su
/// </summary>
public class BlogCategoryListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int PostCount { get; set; }
    public bool IsActive { get; set; }
}
