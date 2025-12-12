namespace Stocker.Modules.CMS.Application.DTOs;

// ==================== Testimonial DTOs ====================
public record TestimonialDto(
    Guid Id,
    string Name,
    string? Role,
    string? Company,
    string Content,
    int Rating,
    string? Avatar,
    int SortOrder,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt
);

public record CreateTestimonialDto(
    string Name,
    string? Role,
    string? Company,
    string Content,
    int Rating = 5,
    string? Avatar = null,
    int SortOrder = 0,
    bool IsActive = true,
    bool IsFeatured = false
);

public record UpdateTestimonialDto(
    string Name,
    string? Role,
    string? Company,
    string Content,
    int Rating,
    string? Avatar,
    int SortOrder,
    bool IsActive,
    bool IsFeatured
);

// ==================== Pricing DTOs ====================
public record PricingPlanDto(
    Guid Id,
    string Name,
    string? Slug,
    string? Description,
    decimal Price,
    string Currency,
    string BillingPeriod,
    decimal? OriginalPrice,
    string? Badge,
    string? ButtonText,
    string? ButtonUrl,
    bool IsPopular,
    bool IsActive,
    int SortOrder,
    List<PricingFeatureDto> Features,
    DateTime CreatedAt
);

public record CreatePricingPlanDto(
    string Name,
    string? Slug,
    string? Description,
    decimal Price,
    string Currency = "TRY",
    string BillingPeriod = "monthly",
    decimal? OriginalPrice = null,
    string? Badge = null,
    string? ButtonText = null,
    string? ButtonUrl = null,
    bool IsPopular = false,
    bool IsActive = true,
    int SortOrder = 0
);

public record UpdatePricingPlanDto(
    string Name,
    string? Slug,
    string? Description,
    decimal Price,
    string Currency,
    string BillingPeriod,
    decimal? OriginalPrice,
    string? Badge,
    string? ButtonText,
    string? ButtonUrl,
    bool IsPopular,
    bool IsActive,
    int SortOrder
);

public record PricingFeatureDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsIncluded,
    string? Value,
    int SortOrder,
    bool IsActive,
    Guid PlanId
);

public record CreatePricingFeatureDto(
    string Name,
    string? Description = null,
    bool IsIncluded = true,
    string? Value = null,
    int SortOrder = 0,
    bool IsActive = true,
    Guid PlanId = default
);

public record UpdatePricingFeatureDto(
    string Name,
    string? Description,
    bool IsIncluded,
    string? Value,
    int SortOrder,
    bool IsActive
);

// ==================== Feature DTOs ====================
public record FeatureDto(
    Guid Id,
    string Title,
    string? Description,
    string? Icon,
    string? IconColor,
    string? Image,
    string? Category,
    int SortOrder,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt
);

public record CreateFeatureDto(
    string Title,
    string? Description = null,
    string? Icon = null,
    string? IconColor = null,
    string? Image = null,
    string? Category = null,
    int SortOrder = 0,
    bool IsActive = true,
    bool IsFeatured = false
);

public record UpdateFeatureDto(
    string Title,
    string? Description,
    string? Icon,
    string? IconColor,
    string? Image,
    string? Category,
    int SortOrder,
    bool IsActive,
    bool IsFeatured
);

// ==================== Industry DTOs ====================
public record IndustryDto(
    Guid Id,
    string Name,
    string? Slug,
    string? Description,
    string? Icon,
    string? Image,
    string? Color,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateIndustryDto(
    string Name,
    string? Slug = null,
    string? Description = null,
    string? Icon = null,
    string? Image = null,
    string? Color = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateIndustryDto(
    string Name,
    string? Slug,
    string? Description,
    string? Icon,
    string? Image,
    string? Color,
    int SortOrder,
    bool IsActive
);

// ==================== Integration DTOs ====================
public record IntegrationDto(
    Guid Id,
    string Name,
    string? Slug,
    string? Description,
    string? Icon,
    string? Color,
    int SortOrder,
    bool IsActive,
    List<IntegrationItemDto> Items,
    DateTime CreatedAt
);

public record CreateIntegrationDto(
    string Name,
    string? Slug = null,
    string? Description = null,
    string? Icon = null,
    string? Color = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateIntegrationDto(
    string Name,
    string? Slug,
    string? Description,
    string? Icon,
    string? Color,
    int SortOrder,
    bool IsActive
);

public record IntegrationItemDto(
    Guid Id,
    string Name,
    string? Description,
    string? Logo,
    string? Url,
    int SortOrder,
    bool IsActive,
    Guid IntegrationId
);

public record CreateIntegrationItemDto(
    string Name,
    string? Description = null,
    string? Logo = null,
    string? Url = null,
    int SortOrder = 0,
    bool IsActive = true,
    Guid IntegrationId = default
);

public record UpdateIntegrationItemDto(
    string Name,
    string? Description,
    string? Logo,
    string? Url,
    int SortOrder,
    bool IsActive
);

// ==================== Stat DTOs ====================
public record StatDto(
    Guid Id,
    string Label,
    string Value,
    string? Suffix,
    string? Prefix,
    string? Icon,
    string? Section,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateStatDto(
    string Label,
    string Value,
    string? Suffix = null,
    string? Prefix = null,
    string? Icon = null,
    string? Section = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateStatDto(
    string Label,
    string Value,
    string? Suffix,
    string? Prefix,
    string? Icon,
    string? Section,
    int SortOrder,
    bool IsActive
);

// ==================== Partner DTOs ====================
public record PartnerDto(
    Guid Id,
    string Name,
    string? Logo,
    string? LogoDark,
    string? Url,
    int SortOrder,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt
);

public record CreatePartnerDto(
    string Name,
    string? Logo = null,
    string? LogoDark = null,
    string? Url = null,
    int SortOrder = 0,
    bool IsActive = true,
    bool IsFeatured = false
);

public record UpdatePartnerDto(
    string Name,
    string? Logo,
    string? LogoDark,
    string? Url,
    int SortOrder,
    bool IsActive,
    bool IsFeatured
);

// ==================== Achievement DTOs ====================
public record AchievementDto(
    Guid Id,
    string Title,
    string Value,
    string? Icon,
    string? IconColor,
    string? Description,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateAchievementDto(
    string Title,
    string Value,
    string? Icon = null,
    string? IconColor = null,
    string? Description = null,
    int SortOrder = 0,
    bool IsActive = true
);

public record UpdateAchievementDto(
    string Title,
    string Value,
    string? Icon,
    string? IconColor,
    string? Description,
    int SortOrder,
    bool IsActive
);
