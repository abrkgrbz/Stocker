namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for ProductVariant entity
/// </summary>
public class ProductVariantDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string? PriceCurrency { get; set; }
    public decimal? CostPrice { get; set; }
    public string? CostPriceCurrency { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string? CompareAtPriceCurrency { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public string? Dimensions { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public decimal LowStockThreshold { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ProductVariantOptionDto> Options { get; set; } = new();
    public decimal TotalStock { get; set; }
}

/// <summary>
/// DTO for ProductVariantOption (attribute value for a variant)
/// </summary>
public class ProductVariantOptionDto
{
    public int Id { get; set; }
    public int ProductVariantId { get; set; }
    public int ProductAttributeId { get; set; }
    public string AttributeCode { get; set; } = string.Empty;
    public string AttributeName { get; set; } = string.Empty;
    public int? ProductAttributeOptionId { get; set; }
    public string Value { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for creating a ProductVariant
/// </summary>
public class CreateProductVariantDto
{
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string? PriceCurrency { get; set; }
    public decimal? CostPrice { get; set; }
    public string? CostPriceCurrency { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string? CompareAtPriceCurrency { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public string? Dimensions { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsDefault { get; set; }
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }
    public decimal LowStockThreshold { get; set; }
    public int DisplayOrder { get; set; }
    public List<CreateProductVariantOptionDto>? Options { get; set; }
}

/// <summary>
/// DTO for creating a ProductVariantOption
/// </summary>
public class CreateProductVariantOptionDto
{
    public int ProductAttributeId { get; set; }
    public int? ProductAttributeOptionId { get; set; }
    public string Value { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for updating a ProductVariant
/// </summary>
public class UpdateProductVariantDto
{
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string? PriceCurrency { get; set; }
    public decimal? CostPrice { get; set; }
    public string? CostPriceCurrency { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string? CompareAtPriceCurrency { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public string? Dimensions { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public decimal LowStockThreshold { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for listing ProductVariants (lightweight)
/// </summary>
public class ProductVariantListDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string? PriceCurrency { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public string OptionsSummary { get; set; } = string.Empty;
    public decimal TotalStock { get; set; }
}
