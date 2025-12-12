namespace Stocker.Modules.CMS.Application.DTOs;

// Category DTOs
public record FAQCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int SortOrder,
    bool IsActive,
    int ItemCount,
    IEnumerable<FAQItemDto> Items
);

public record FAQCategoryListDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int SortOrder,
    bool IsActive,
    int ItemCount
);

public record CreateFAQCategoryDto(
    string Name,
    string Slug,
    string? Description = null,
    string? Icon = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateFAQCategoryDto(
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int SortOrder,
    bool IsActive
);

// Item DTOs
public record FAQItemDto(
    Guid Id,
    string Question,
    string Answer,
    int SortOrder,
    bool IsActive,
    int ViewCount,
    int HelpfulCount,
    int NotHelpfulCount,
    Guid CategoryId,
    string? CategoryName
);

public record CreateFAQItemDto(
    string Question,
    string Answer,
    Guid CategoryId,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateFAQItemDto(
    string Question,
    string Answer,
    Guid CategoryId,
    int SortOrder,
    bool IsActive
);
