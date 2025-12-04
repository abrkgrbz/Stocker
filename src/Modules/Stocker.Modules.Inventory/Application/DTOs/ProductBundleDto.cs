using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for ProductBundle entity
/// </summary>
public class ProductBundleDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BundleType BundleType { get; set; }
    public BundlePricingType PricingType { get; set; }
    public decimal? FixedPrice { get; set; }
    public string? FixedPriceCurrency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
    public bool RequireAllItems { get; set; }
    public int? MinSelectableItems { get; set; }
    public int? MaxSelectableItems { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsValid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ProductBundleItemDto> Items { get; set; } = new();
    public decimal CalculatedPrice { get; set; }
}

/// <summary>
/// DTO for ProductBundleItem
/// </summary>
public class ProductBundleItemDto
{
    public int Id { get; set; }
    public int ProductBundleId { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public bool IsRequired { get; set; }
    public bool IsDefault { get; set; }
    public decimal? OverridePrice { get; set; }
    public string? OverridePriceCurrency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public int DisplayOrder { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public decimal? ProductPrice { get; set; }
    public string? ProductPriceCurrency { get; set; }
}

/// <summary>
/// DTO for creating a ProductBundle
/// </summary>
public class CreateProductBundleDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BundleType BundleType { get; set; } = BundleType.FixedBundle;
    public BundlePricingType PricingType { get; set; } = BundlePricingType.SumOfItems;
    public decimal? FixedPrice { get; set; }
    public string? FixedPriceCurrency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
    public bool RequireAllItems { get; set; } = true;
    public int? MinSelectableItems { get; set; }
    public int? MaxSelectableItems { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public List<CreateProductBundleItemDto>? Items { get; set; }
}

/// <summary>
/// DTO for creating a ProductBundleItem
/// </summary>
public class CreateProductBundleItemDto
{
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public bool IsRequired { get; set; } = true;
    public bool IsDefault { get; set; } = true;
    public decimal? OverridePrice { get; set; }
    public string? OverridePriceCurrency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public int DisplayOrder { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
}

/// <summary>
/// DTO for updating a ProductBundle
/// </summary>
public class UpdateProductBundleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BundlePricingType PricingType { get; set; }
    public decimal? FixedPrice { get; set; }
    public string? FixedPriceCurrency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
    public bool RequireAllItems { get; set; }
    public int? MinSelectableItems { get; set; }
    public int? MaxSelectableItems { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for updating a ProductBundleItem
/// </summary>
public class UpdateProductBundleItemDto
{
    public decimal Quantity { get; set; }
    public bool IsRequired { get; set; }
    public bool IsDefault { get; set; }
    public decimal? OverridePrice { get; set; }
    public string? OverridePriceCurrency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public int DisplayOrder { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
}

/// <summary>
/// DTO for listing ProductBundles (lightweight)
/// </summary>
public class ProductBundleListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public BundleType BundleType { get; set; }
    public BundlePricingType PricingType { get; set; }
    public decimal? FixedPrice { get; set; }
    public string? FixedPriceCurrency { get; set; }
    public bool IsActive { get; set; }
    public bool IsValid { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public int DisplayOrder { get; set; }
    public int ItemCount { get; set; }
}
