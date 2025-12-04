using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Product entity
/// </summary>
public class ProductDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int? BrandId { get; set; }
    public string? BrandName { get; set; }
    public int UnitId { get; set; }
    public string? UnitName { get; set; }
    public string? UnitSymbol { get; set; }
    public ProductType ProductType { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? UnitPriceCurrency { get; set; }
    public decimal? CostPrice { get; set; }
    public string? CostPriceCurrency { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public string? DimensionUnit { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public int LeadTimeDays { get; set; }
    public bool TrackSerialNumbers { get; set; }
    public bool TrackLotNumbers { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal TotalStockQuantity { get; set; }
    public decimal AvailableStockQuantity { get; set; }
    public List<ProductAttributeSimpleDto> Attributes { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
}

/// <summary>
/// DTO for creating a product
/// </summary>
public class CreateProductDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public int UnitId { get; set; }
    public ProductType ProductType { get; set; } = ProductType.Finished;
    public decimal? UnitPrice { get; set; }
    public string? UnitPriceCurrency { get; set; }
    public decimal? CostPrice { get; set; }
    public string? CostPriceCurrency { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public string? DimensionUnit { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public int LeadTimeDays { get; set; }
    public bool TrackSerialNumbers { get; set; }
    public bool TrackLotNumbers { get; set; }
}

/// <summary>
/// DTO for updating a product
/// </summary>
public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public int UnitId { get; set; }
    public ProductType ProductType { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? UnitPriceCurrency { get; set; }
    public decimal? CostPrice { get; set; }
    public string? CostPriceCurrency { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public string? DimensionUnit { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public int LeadTimeDays { get; set; }
    public bool TrackSerialNumbers { get; set; }
    public bool TrackLotNumbers { get; set; }
}

/// <summary>
/// DTO for product listing (lightweight)
/// </summary>
public class ProductListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public string? CategoryName { get; set; }
    public string? BrandName { get; set; }
    public string? UnitName { get; set; }
    public ProductType ProductType { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal TotalStockQuantity { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// Simple DTO for product attribute values (used in product listing)
/// </summary>
public class ProductAttributeSimpleDto
{
    public int Id { get; set; }
    public string AttributeName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

/// <summary>
/// DTO for product images
/// </summary>
public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}
