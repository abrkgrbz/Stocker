using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record DiscountDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Type { get; init; } = string.Empty;
    public string ValueType { get; init; } = string.Empty;
    public decimal Value { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public int? MinimumQuantity { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public bool IsActive { get; init; }
    public int? UsageLimit { get; init; }
    public int UsageCount { get; init; }
    public bool IsStackable { get; init; }
    public int Priority { get; init; }
    public string Applicability { get; init; } = string.Empty;
    public string? ApplicableProductIds { get; init; }
    public string? ApplicableCategoryIds { get; init; }
    public string? ApplicableCustomerIds { get; init; }
    public string? ApplicableCustomerGroupIds { get; init; }
    public string? ExcludedProductIds { get; init; }
    public string? ExcludedCategoryIds { get; init; }
    public bool RequiresCouponCode { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public bool IsValid { get; init; }
}

public record DiscountListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string ValueType { get; init; } = string.Empty;
    public decimal Value { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public bool IsActive { get; init; }
    public int UsageCount { get; init; }
    public int? UsageLimit { get; init; }
    public bool IsValid { get; init; }
}

public record CreateDiscountDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DiscountType Type { get; init; }
    public DiscountValueType ValueType { get; init; }
    public decimal Value { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public int? MinimumQuantity { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int? UsageLimit { get; init; }
    public bool IsStackable { get; init; }
    public int Priority { get; init; }
    public DiscountApplicability Applicability { get; init; }
    public List<Guid>? ApplicableProductIds { get; init; }
    public List<Guid>? ApplicableCategoryIds { get; init; }
    public List<Guid>? ApplicableCustomerIds { get; init; }
    public List<Guid>? ApplicableCustomerGroupIds { get; init; }
    public List<Guid>? ExcludedProductIds { get; init; }
    public List<Guid>? ExcludedCategoryIds { get; init; }
}

public record UpdateDiscountDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Value { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public int? MinimumQuantity { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int? UsageLimit { get; init; }
    public bool IsStackable { get; init; }
    public int Priority { get; init; }
}

public record ApplyDiscountDto
{
    public string Code { get; init; } = string.Empty;
    public decimal OrderAmount { get; init; }
    public int Quantity { get; init; } = 1;
}

public record DiscountCalculationResultDto
{
    public bool IsValid { get; init; }
    public decimal DiscountAmount { get; init; }
    public string? ErrorMessage { get; init; }
}
