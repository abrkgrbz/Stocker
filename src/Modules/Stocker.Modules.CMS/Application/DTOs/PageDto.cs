using Stocker.Modules.CMS.Domain.Enums;

namespace Stocker.Modules.CMS.Application.DTOs;

public record PageDto(
    Guid Id,
    string Title,
    string Slug,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string Content,
    PageStatus Status,
    int SortOrder,
    string? FeaturedImage,
    string? Template,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreatePageDto(
    string Title,
    string Slug,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string Content,
    PageStatus Status = PageStatus.Draft,
    int SortOrder = 0,
    string? FeaturedImage = null,
    string? Template = null
);

public record UpdatePageDto(
    string Title,
    string Slug,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string Content,
    PageStatus Status,
    int SortOrder,
    string? FeaturedImage,
    string? Template
);
