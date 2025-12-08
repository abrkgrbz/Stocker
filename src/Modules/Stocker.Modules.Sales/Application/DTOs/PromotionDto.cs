using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record PromotionDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Type { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public int Priority { get; init; }
    public bool IsStackable { get; init; }
    public bool IsExclusive { get; init; }
    public int? UsageLimit { get; init; }
    public int? UsageLimitPerCustomer { get; init; }
    public int TotalUsageCount { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public string? ApplicableChannels { get; init; }
    public string? TargetCustomerSegments { get; init; }
    public string? TargetProductCategories { get; init; }
    public string? ExcludedProducts { get; init; }
    public string? ImageUrl { get; init; }
    public string? BannerUrl { get; init; }
    public string? TermsAndConditions { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public bool IsValid { get; init; }
    public List<PromotionRuleDto> Rules { get; init; } = new();
}

public record PromotionRuleDto
{
    public Guid Id { get; init; }
    public string RuleType { get; init; } = string.Empty;
    public string? Condition { get; init; }
    public string DiscountType { get; init; } = string.Empty;
    public decimal DiscountValue { get; init; }
    public string? ApplicableProducts { get; init; }
    public string? ApplicableCategories { get; init; }
    public int? MinimumQuantity { get; init; }
    public int? MaximumQuantity { get; init; }
    public Guid? FreeProductId { get; init; }
    public int? FreeProductQuantity { get; init; }
    public int SortOrder { get; init; }
}

public record PromotionListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public int TotalUsageCount { get; init; }
    public int RuleCount { get; init; }
    public bool IsValid { get; init; }
}

public record CreatePromotionDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public PromotionType Type { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Priority { get; init; }
    public bool IsStackable { get; init; }
    public bool IsExclusive { get; init; }
    public int? UsageLimit { get; init; }
    public int? UsageLimitPerCustomer { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public string? ApplicableChannels { get; init; }
    public string? TargetCustomerSegments { get; init; }
    public string? TargetProductCategories { get; init; }
    public string? ExcludedProducts { get; init; }
    public string? ImageUrl { get; init; }
    public string? BannerUrl { get; init; }
    public string? TermsAndConditions { get; init; }
    public List<CreatePromotionRuleDto> Rules { get; init; } = new();
}

public record CreatePromotionRuleDto
{
    public PromotionRuleType RuleType { get; init; }
    public string? Condition { get; init; }
    public DiscountValueType DiscountType { get; init; }
    public decimal DiscountValue { get; init; }
    public List<Guid>? ApplicableProducts { get; init; }
    public List<Guid>? ApplicableCategories { get; init; }
    public int? MinimumQuantity { get; init; }
    public int? MaximumQuantity { get; init; }
    public Guid? FreeProductId { get; init; }
    public int? FreeProductQuantity { get; init; }
}

public record UpdatePromotionDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Priority { get; init; }
    public bool IsStackable { get; init; }
    public bool IsExclusive { get; init; }
    public int? UsageLimit { get; init; }
    public int? UsageLimitPerCustomer { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public string? ImageUrl { get; init; }
    public string? BannerUrl { get; init; }
    public string? TermsAndConditions { get; init; }
}
