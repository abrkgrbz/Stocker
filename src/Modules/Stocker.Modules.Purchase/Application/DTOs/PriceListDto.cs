using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record PriceListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public Guid? SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string? SupplierName { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IsDefault { get; init; }
    public int Version { get; init; }
    public Guid? PreviousVersionId { get; init; }
    public Guid? CreatedById { get; init; }
    public string? CreatedByName { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<PriceListItemDto> Items { get; init; } = new();
}

public record PriceListItemDto
{
    public Guid Id { get; init; }
    public Guid PriceListId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal BasePrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal DiscountedPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? MinQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public bool IsActive { get; init; }
    public string? Notes { get; init; }
    public List<PriceListItemTierDto> Tiers { get; init; } = new();
}

public record PriceListItemTierDto
{
    public Guid Id { get; init; }
    public Guid PriceListItemId { get; init; }
    public decimal MinQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
    public int TierLevel { get; init; }
}

public record PriceListListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? SupplierName { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IsDefault { get; init; }
    public int Version { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreatePriceListDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public PriceListType Type { get; init; } = PriceListType.Supplier;
    public Guid? SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string? SupplierName { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IsDefault { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public List<CreatePriceListItemDto> Items { get; init; } = new();
}

public record CreatePriceListItemDto
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Unit { get; init; } = "Adet";
    public decimal BasePrice { get; init; }
    public decimal DiscountRate { get; init; }
    public decimal? MinQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public string? Notes { get; init; }
    public List<CreatePriceListItemTierDto> Tiers { get; init; } = new();
}

public record CreatePriceListItemTierDto
{
    public decimal MinQuantity { get; init; }
    public decimal? MaxQuantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal DiscountRate { get; init; }
}

public record UpdatePriceListDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public bool? IsDefault { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record PriceLookupRequestDto
{
    public Guid? SupplierId { get; init; }
    public Guid ProductId { get; init; }
    public decimal Quantity { get; init; } = 1;
    public DateTime? AsOfDate { get; init; }
}

public record PriceLookupResultDto
{
    public bool Found { get; init; }
    public Guid? PriceListId { get; init; }
    public string? PriceListCode { get; init; }
    public string? PriceListName { get; init; }
    public decimal? BasePrice { get; init; }
    public decimal? DiscountRate { get; init; }
    public decimal? EffectivePrice { get; init; }
    public string? TierApplied { get; init; }
    public string? Currency { get; init; }
    public string? Message { get; init; }
}

public record PriceListSummaryDto
{
    public int TotalPriceLists { get; init; }
    public int ActivePriceLists { get; init; }
    public int DraftPriceLists { get; init; }
    public int ExpiredPriceLists { get; init; }
    public int TotalProducts { get; init; }
    public Dictionary<string, int> PriceListsByStatus { get; init; } = new();
    public Dictionary<string, int> PriceListsByType { get; init; } = new();
    public Dictionary<string, int> PriceListsBySupplier { get; init; } = new();
}
