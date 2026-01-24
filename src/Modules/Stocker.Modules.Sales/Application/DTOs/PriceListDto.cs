using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record PriceListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Type { get; init; } = string.Empty;
    public string CurrencyCode { get; init; } = "TRY";
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
    public bool IsTaxIncluded { get; init; }
    public int Priority { get; init; }
    public decimal? MinimumOrderAmount { get; init; }
    public string? MinimumOrderCurrency { get; init; }
    public bool IsActive { get; init; }
    public Guid? BasePriceListId { get; init; }
    public decimal? BaseAdjustmentPercentage { get; init; }
    public Guid? SalesTerritoryId { get; init; }
    public string? CustomerSegment { get; init; }
    public List<PriceListItemDto> Items { get; init; } = new();
    public List<PriceListCustomerDto> AssignedCustomers { get; init; } = new();
}

public record PriceListListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string CurrencyCode { get; init; } = "TRY";
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
    public bool IsActive { get; init; }
    public int Priority { get; init; }
    public int ItemCount { get; init; }
    public int CustomerCount { get; init; }
}

public record PriceListItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public string UnitPriceCurrency { get; init; } = "TRY";
    public string UnitOfMeasure { get; init; } = string.Empty;
    public decimal? MinimumQuantity { get; init; }
    public decimal? MaximumQuantity { get; init; }
    public decimal? DiscountPercentage { get; init; }
    public DateTime LastPriceUpdate { get; init; }
    public decimal? PreviousPrice { get; init; }
    public bool IsActive { get; init; }
}

public record PriceListCustomerDto
{
    public Guid Id { get; init; }
    public Guid CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
    public bool IsActive { get; init; }
}

public record CreatePriceListDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public PriceListType Type { get; init; }
    public string CurrencyCode { get; init; } = "TRY";
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
    public bool IsTaxIncluded { get; init; }
    public int Priority { get; init; }
}

public record UpdatePriceListDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string CurrencyCode { get; init; } = "TRY";
    public DateTime ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
    public bool IsTaxIncluded { get; init; }
    public int Priority { get; init; }
}

public record AddPriceListItemDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public string UnitOfMeasure { get; init; } = string.Empty;
    public decimal? MinimumQuantity { get; init; }
    public decimal? MaximumQuantity { get; init; }
}

public record UpdatePriceListItemDto
{
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
}

public record AssignCustomerDto
{
    public Guid CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public DateTime? ValidFrom { get; init; }
    public DateTime? ValidTo { get; init; }
}

public record BulkAdjustmentDto
{
    public decimal PercentageChange { get; init; }
}

public record GetProductPriceDto
{
    public Guid ProductId { get; init; }
    public decimal Quantity { get; init; } = 1;
}

public record ProductPriceResultDto
{
    public Guid ProductId { get; init; }
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PriceListCode { get; init; } = string.Empty;
    public string PriceListName { get; init; } = string.Empty;
}
