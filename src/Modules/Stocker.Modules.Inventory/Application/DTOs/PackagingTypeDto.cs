namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for PackagingType entity
/// </summary>
public record PackagingTypeDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Category { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public decimal? Length { get; init; }
    public decimal? Width { get; init; }
    public decimal? Height { get; init; }
    public decimal? Volume { get; init; }
    public decimal? EmptyWeight { get; init; }
    public decimal? MaxWeightCapacity { get; init; }
    public decimal? DefaultQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public int? StackableCount { get; init; }
    public bool IsStackable { get; init; }
    public int? UnitsPerPallet { get; init; }
    public int? UnitsPerPalletLayer { get; init; }
    public string? BarcodePrefix { get; init; }
    public string? DefaultBarcodeType { get; init; }
    public string? MaterialType { get; init; }
    public bool IsRecyclable { get; init; }
    public bool IsReturnable { get; init; }
    public decimal? DepositAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// DTO for creating a packaging type
/// </summary>
public record CreatePackagingTypeDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Category { get; init; } = string.Empty;
    public decimal? Length { get; init; }
    public decimal? Width { get; init; }
    public decimal? Height { get; init; }
    public decimal? EmptyWeight { get; init; }
    public decimal? MaxWeightCapacity { get; init; }
    public decimal? DefaultQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public int? StackableCount { get; init; }
    public bool IsStackable { get; init; } = true;
    public int? UnitsPerPallet { get; init; }
    public int? UnitsPerPalletLayer { get; init; }
    public string? BarcodePrefix { get; init; }
    public string? DefaultBarcodeType { get; init; }
    public string? MaterialType { get; init; }
    public bool IsRecyclable { get; init; }
    public bool IsReturnable { get; init; }
    public decimal? DepositAmount { get; init; }
}

/// <summary>
/// DTO for updating a packaging type
/// </summary>
public record UpdatePackagingTypeDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public decimal? Length { get; init; }
    public decimal? Width { get; init; }
    public decimal? Height { get; init; }
    public decimal? EmptyWeight { get; init; }
    public decimal? MaxWeightCapacity { get; init; }
    public decimal? DefaultQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public int? StackableCount { get; init; }
    public bool IsStackable { get; init; }
    public int? UnitsPerPallet { get; init; }
    public int? UnitsPerPalletLayer { get; init; }
    public string? BarcodePrefix { get; init; }
    public string? DefaultBarcodeType { get; init; }
    public string? MaterialType { get; init; }
    public bool IsRecyclable { get; init; }
    public bool IsReturnable { get; init; }
    public decimal? DepositAmount { get; init; }
}
