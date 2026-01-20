namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for BarcodeDefinition entity
/// </summary>
public record BarcodeDefinitionDto
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string? ProductName { get; init; }
    public string? ProductCode { get; init; }
    public int? ProductVariantId { get; init; }
    public string? ProductVariantName { get; init; }
    public string Barcode { get; init; } = string.Empty;
    public string BarcodeType { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
    public bool IsActive { get; init; }
    public int? UnitId { get; init; }
    public string? UnitName { get; init; }
    public decimal QuantityPerUnit { get; init; }
    public int? PackagingTypeId { get; init; }
    public string? PackagingTypeName { get; init; }
    public bool IsManufacturerBarcode { get; init; }
    public string? ManufacturerCode { get; init; }
    public string? Gtin { get; init; }
    public string? Description { get; init; }
    public DateTime? ValidFrom { get; init; }
    public DateTime? ValidUntil { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// DTO for creating a barcode definition
/// </summary>
public record CreateBarcodeDefinitionDto
{
    public int ProductId { get; init; }
    public int? ProductVariantId { get; init; }
    public string Barcode { get; init; } = string.Empty;
    public string BarcodeType { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
    public int? UnitId { get; init; }
    public decimal QuantityPerUnit { get; init; } = 1;
    public int? PackagingTypeId { get; init; }
    public bool IsManufacturerBarcode { get; init; }
    public string? ManufacturerCode { get; init; }
    public string? Gtin { get; init; }
    public string? Description { get; init; }
    public DateTime? ValidFrom { get; init; }
    public DateTime? ValidUntil { get; init; }
}

/// <summary>
/// DTO for updating a barcode definition
/// </summary>
public record UpdateBarcodeDefinitionDto
{
    public int? ProductVariantId { get; init; }
    public bool IsPrimary { get; init; }
    public bool IsActive { get; init; }
    public bool IsManufacturerBarcode { get; init; }
    public int? UnitId { get; init; }
    public decimal QuantityPerUnit { get; init; } = 1;
    public int? PackagingTypeId { get; init; }
    public string? ManufacturerCode { get; init; }
    public string? Gtin { get; init; }
    public string? Description { get; init; }
    public DateTime? ValidFrom { get; init; }
    public DateTime? ValidUntil { get; init; }
}
