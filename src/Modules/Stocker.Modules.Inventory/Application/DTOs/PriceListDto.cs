namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for PriceList entity
/// </summary>
public class PriceListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int? CustomerGroupId { get; set; }
    public decimal? GlobalDiscountPercentage { get; set; }
    public decimal? GlobalMarkupPercentage { get; set; }
    public int Priority { get; set; }
    public bool IsValid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ItemCount { get; set; }
    public List<PriceListItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO for creating a price list
/// </summary>
public class CreatePriceListDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsDefault { get; set; }
    public int? CustomerGroupId { get; set; }
    public decimal? GlobalDiscountPercentage { get; set; }
    public decimal? GlobalMarkupPercentage { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for updating a price list
/// </summary>
public class UpdatePriceListDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public int? CustomerGroupId { get; set; }
    public decimal? GlobalDiscountPercentage { get; set; }
    public decimal? GlobalMarkupPercentage { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for price list item
/// </summary>
public class PriceListItemDto
{
    public int Id { get; set; }
    public int PriceListId { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal? MinQuantity { get; set; }
    public decimal? MaxQuantity { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for creating/updating a price list item
/// </summary>
public class CreatePriceListItemDto
{
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public decimal? MinQuantity { get; set; }
    public decimal? MaxQuantity { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}

/// <summary>
/// DTO for bulk price update
/// </summary>
public class BulkPriceUpdateDto
{
    public int PriceListId { get; set; }
    public List<CreatePriceListItemDto> Items { get; set; } = new();
    public bool ReplaceExisting { get; set; } = false;
}

/// <summary>
/// DTO for price list listing (lightweight)
/// </summary>
public class PriceListListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public bool IsValid { get; set; } // Currently within valid date range
    public decimal? GlobalDiscountPercentage { get; set; }
    public decimal? GlobalMarkupPercentage { get; set; }
    public int Priority { get; set; }
    public int ItemCount { get; set; }
}

/// <summary>
/// DTO for getting product price
/// </summary>
public class ProductPriceDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal? ListPrice { get; set; }
    public string? PriceListName { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal FinalPrice { get; set; }
    public string Currency { get; set; } = string.Empty;
}
