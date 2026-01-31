using Stocker.Domain.Master.Enums.CMS;

namespace Stocker.Application.DTOs.CMS;

/// <summary>
/// CMS sayfa detay DTO'su
/// </summary>
public class CmsPageDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public PageStatus Status { get; set; }
    public string StatusText => Status.ToString().ToLowerInvariant();
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? FeaturedImage { get; set; }
    public AuthorDto Author { get; set; } = null!;
    public long Views { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
}

/// <summary>
/// CMS sayfa liste DTO'su
/// </summary>
public class CmsPageListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public PageStatus Status { get; set; }
    public string StatusText => Status.ToString().ToLowerInvariant();
    public string? FeaturedImage { get; set; }
    public AuthorDto Author { get; set; } = null!;
    public long Views { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Yazar bilgisi DTO'su
/// </summary>
public class AuthorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; }
}

/// <summary>
/// Slug kontrol sonucu DTO'su
/// </summary>
public class SlugCheckResultDto
{
    public bool IsAvailable { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? SuggestedSlug { get; set; }
}
