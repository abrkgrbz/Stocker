using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesProducts.Commands;

/// <summary>
/// Command to create a new sales product
/// </summary>
public record CreateSalesProductCommand : IRequest<Result<SalesProductDto>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public SalesProductType ProductType { get; init; } = SalesProductType.Product;

    // Identification
    public string? Barcode { get; init; }
    public string? SKU { get; init; }
    public string? GtipCode { get; init; }

    // Unit
    public string Unit { get; init; } = "C62";
    public string UnitDescription { get; init; } = "Adet";

    // Pricing
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? CostPrice { get; init; }
    public decimal? MinimumSalePrice { get; init; }
    public decimal? ListPrice { get; init; }
    public bool IsPriceIncludingVat { get; init; }

    // Tax
    public decimal VatRate { get; init; } = 20;
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }
    public decimal? SpecialConsumptionTaxRate { get; init; }
    public decimal? SpecialConsumptionTaxAmount { get; init; }

    // Stock
    public bool TrackStock { get; init; } = true;
    public decimal InitialStock { get; init; }
    public decimal MinimumStock { get; init; }
    public decimal? Weight { get; init; }

    // Category
    public string? Category { get; init; }
    public string? SubCategory { get; init; }
    public string? Brand { get; init; }
    public string? Tags { get; init; }

    // Images
    public string? ImageUrl { get; init; }
    public string? ThumbnailUrl { get; init; }

    // Status
    public bool IsAvailableForSale { get; init; } = true;
    public bool ShowOnWeb { get; init; } = true;
    public string? Notes { get; init; }
}

/// <summary>
/// Command to update an existing sales product
/// </summary>
public record UpdateSalesProductCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }

    // Identification
    public string? Barcode { get; init; }
    public string? SKU { get; init; }
    public string? GtipCode { get; init; }

    // Unit
    public string? Unit { get; init; }
    public string? UnitDescription { get; init; }

    // Pricing
    public decimal? UnitPrice { get; init; }
    public string? Currency { get; init; }
    public decimal? CostPrice { get; init; }
    public decimal? MinimumSalePrice { get; init; }
    public decimal? ListPrice { get; init; }
    public bool? IsPriceIncludingVat { get; init; }

    // Tax
    public decimal? VatRate { get; init; }
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }
    public decimal? SpecialConsumptionTaxRate { get; init; }
    public decimal? SpecialConsumptionTaxAmount { get; init; }

    // Stock
    public bool? TrackStock { get; init; }
    public decimal? MinimumStock { get; init; }
    public decimal? Weight { get; init; }

    // Category
    public string? Category { get; init; }
    public string? SubCategory { get; init; }
    public string? Brand { get; init; }
    public string? Tags { get; init; }

    // Images
    public string? ImageUrl { get; init; }
    public string? ThumbnailUrl { get; init; }

    // Status
    public bool? IsActive { get; init; }
    public bool? IsAvailableForSale { get; init; }
    public bool? ShowOnWeb { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Command to delete a sales product (soft delete)
/// </summary>
public record DeleteSalesProductCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Command to activate a sales product
/// </summary>
public record ActivateSalesProductCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Command to deactivate a sales product
/// </summary>
public record DeactivateSalesProductCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Command to adjust product stock
/// </summary>
public record AdjustProductStockCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
    public decimal Quantity { get; init; }
    public string Reason { get; init; } = string.Empty;
}

/// <summary>
/// Command to update product pricing
/// </summary>
public record UpdateProductPricingCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
    public decimal UnitPrice { get; init; }
    public string? Currency { get; init; }
    public decimal? CostPrice { get; init; }
    public decimal? MinimumSalePrice { get; init; }
    public decimal? ListPrice { get; init; }
    public bool? IsPriceIncludingVat { get; init; }
}

/// <summary>
/// Command to update product tax info
/// </summary>
public record UpdateProductTaxInfoCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
    public decimal VatRate { get; init; }
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }
    public decimal? SpecialConsumptionTaxRate { get; init; }
    public decimal? SpecialConsumptionTaxAmount { get; init; }
}

/// <summary>
/// Command to set product for web visibility
/// </summary>
public record SetProductWebVisibilityCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
    public bool ShowOnWeb { get; init; }
}

/// <summary>
/// Command to set product availability for sale
/// </summary>
public record SetProductSaleAvailabilityCommand : IRequest<Result<SalesProductDto>>
{
    public Guid Id { get; init; }
    public bool IsAvailableForSale { get; init; }
}
