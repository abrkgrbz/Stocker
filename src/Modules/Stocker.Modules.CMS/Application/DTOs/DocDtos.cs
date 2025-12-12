namespace Stocker.Modules.CMS.Application.DTOs;

// ==================== DocCategory DTOs ====================
public record DocCategoryDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    string? Icon,
    string? Color,
    int SortOrder,
    bool IsActive,
    int ArticleCount,
    List<DocArticleDto> Articles,
    DateTime CreatedAt
);

public record DocCategoryListDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    string? Icon,
    string? Color,
    int SortOrder,
    bool IsActive,
    int ArticleCount
);

public record CreateDocCategoryDto(
    string Title,
    string Slug,
    string? Description = null,
    string? Icon = null,
    string? Color = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateDocCategoryDto(
    string Title,
    string Slug,
    string? Description,
    string? Icon,
    string? Color,
    int SortOrder,
    bool IsActive
);

// ==================== DocArticle DTOs ====================
public record DocArticleDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    string? Content,
    string? Icon,
    string? MetaTitle,
    string? MetaDescription,
    int SortOrder,
    bool IsActive,
    bool IsPopular,
    int ViewCount,
    Guid CategoryId,
    string? CategoryTitle,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record DocArticleListDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    string? Icon,
    int SortOrder,
    bool IsActive,
    bool IsPopular,
    int ViewCount,
    string? CategoryTitle
);

public record CreateDocArticleDto(
    string Title,
    string Slug,
    string? Description = null,
    string? Content = null,
    string? Icon = null,
    string? MetaTitle = null,
    string? MetaDescription = null,
    int SortOrder = 0,
    bool IsActive = true,
    bool IsPopular = false,
    Guid CategoryId = default
);

public record UpdateDocArticleDto(
    string Title,
    string Slug,
    string? Description,
    string? Content,
    string? Icon,
    string? MetaTitle,
    string? MetaDescription,
    int SortOrder,
    bool IsActive,
    bool IsPopular,
    Guid CategoryId
);
