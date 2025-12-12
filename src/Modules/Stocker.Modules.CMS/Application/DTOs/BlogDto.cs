using Stocker.Modules.CMS.Domain.Enums;

namespace Stocker.Modules.CMS.Application.DTOs;

// Category DTOs
public record BlogCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int SortOrder,
    bool IsActive,
    int PostCount,
    DateTime CreatedAt
);

public record CreateBlogCategoryDto(
    string Name,
    string Slug,
    string? Description = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateBlogCategoryDto(
    string Name,
    string Slug,
    string? Description,
    int SortOrder,
    bool IsActive
);

public record BlogCategoryListDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int SortOrder,
    bool IsActive,
    int PostCount
);

// Post DTOs
public record BlogPostDto(
    Guid Id,
    string Title,
    string Slug,
    string? Excerpt,
    string Content,
    string? FeaturedImage,
    string? MetaTitle,
    string? MetaDescription,
    BlogPostStatus Status,
    DateTime? PublishedAt,
    DateTime? ScheduledAt,
    int ViewCount,
    string? ReadTime,
    string? Author,
    string? Tags,
    Guid? CategoryId,
    string? CategoryName,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record BlogPostListDto(
    Guid Id,
    string Title,
    string Slug,
    string? Excerpt,
    string? FeaturedImage,
    BlogPostStatus Status,
    DateTime? PublishedAt,
    int ViewCount,
    string? ReadTime,
    string? Author,
    string? CategoryName
);

public record CreateBlogPostDto(
    string Title,
    string Slug,
    string? Excerpt,
    string Content,
    string? FeaturedImage = null,
    string? MetaTitle = null,
    string? MetaDescription = null,
    BlogPostStatus Status = BlogPostStatus.Draft,
    DateTime? ScheduledAt = null,
    string? ReadTime = null,
    string? Author = null,
    string? Tags = null,
    Guid? CategoryId = null
);

public record UpdateBlogPostDto(
    string Title,
    string Slug,
    string? Excerpt,
    string Content,
    string? FeaturedImage,
    string? MetaTitle,
    string? MetaDescription,
    BlogPostStatus Status,
    DateTime? ScheduledAt,
    string? ReadTime,
    string? Author,
    string? Tags,
    Guid? CategoryId
);
