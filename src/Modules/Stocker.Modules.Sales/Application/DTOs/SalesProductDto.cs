using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Enums;

namespace Stocker.Modules.Sales.Application.DTOs;

/// <summary>
/// Full details DTO for SalesProduct entity
/// Used for single product retrieval and detailed views
/// </summary>
public record SalesProductDto
{
    public Guid Id { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ProductType { get; init; } = string.Empty;
    public string DataSource { get; init; } = string.Empty;
    public int? InventoryProductId { get; init; }

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
    public decimal VatRate { get; init; }
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }
    public decimal? SpecialConsumptionTaxRate { get; init; }
    public decimal? SpecialConsumptionTaxAmount { get; init; }

    // Stock
    public bool TrackStock { get; init; }
    public decimal StockQuantity { get; init; }
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
    public bool IsActive { get; init; }
    public bool IsAvailableForSale { get; init; }
    public bool ShowOnWeb { get; init; }
    public string? Notes { get; init; }

    // Audit
    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }

    public static SalesProductDto FromEntity(SalesProduct entity)
    {
        return new SalesProductDto
        {
            Id = entity.Id,
            ProductCode = entity.ProductCode,
            Name = entity.Name,
            Description = entity.Description,
            ProductType = entity.ProductType.ToString(),
            DataSource = entity.DataSource.ToString(),
            InventoryProductId = entity.InventoryProductId,
            Barcode = entity.Barcode,
            SKU = entity.SKU,
            GtipCode = entity.GtipCode,
            Unit = entity.Unit,
            UnitDescription = entity.UnitDescription,
            UnitPrice = entity.UnitPrice,
            Currency = entity.Currency,
            CostPrice = entity.CostPrice,
            MinimumSalePrice = entity.MinimumSalePrice,
            ListPrice = entity.ListPrice,
            IsPriceIncludingVat = entity.IsPriceIncludingVat,
            VatRate = entity.VatRate,
            VatExemptionCode = entity.VatExemptionCode,
            VatExemptionReason = entity.VatExemptionReason,
            SpecialConsumptionTaxRate = entity.SpecialConsumptionTaxRate,
            SpecialConsumptionTaxAmount = entity.SpecialConsumptionTaxAmount,
            TrackStock = entity.TrackStock,
            StockQuantity = entity.StockQuantity,
            MinimumStock = entity.MinimumStock,
            Weight = entity.Weight,
            Category = entity.Category,
            SubCategory = entity.SubCategory,
            Brand = entity.Brand,
            Tags = entity.Tags,
            ImageUrl = entity.ImageUrl,
            ThumbnailUrl = entity.ThumbnailUrl,
            IsActive = entity.IsActive,
            IsAvailableForSale = entity.IsAvailableForSale,
            ShowOnWeb = entity.ShowOnWeb,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };
    }
}

/// <summary>
/// List DTO for SalesProduct entity
/// Used for paginated lists and search results
/// </summary>
public record SalesProductListDto
{
    public Guid Id { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string ProductType { get; init; } = string.Empty;
    public string DataSource { get; init; } = string.Empty;
    public string? Barcode { get; init; }
    public string? SKU { get; init; }
    public string Unit { get; init; } = "C62";
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal VatRate { get; init; }
    public decimal StockQuantity { get; init; }
    public string? Category { get; init; }
    public string? Brand { get; init; }
    public string? ThumbnailUrl { get; init; }
    public bool IsActive { get; init; }
    public bool IsAvailableForSale { get; init; }
    public DateTime CreatedAt { get; init; }

    public static SalesProductListDto FromEntity(SalesProduct entity)
    {
        return new SalesProductListDto
        {
            Id = entity.Id,
            ProductCode = entity.ProductCode,
            Name = entity.Name,
            ProductType = entity.ProductType.ToString(),
            DataSource = entity.DataSource.ToString(),
            Barcode = entity.Barcode,
            SKU = entity.SKU,
            Unit = entity.Unit,
            UnitPrice = entity.UnitPrice,
            Currency = entity.Currency,
            VatRate = entity.VatRate,
            StockQuantity = entity.StockQuantity,
            Category = entity.Category,
            Brand = entity.Brand,
            ThumbnailUrl = entity.ThumbnailUrl,
            IsActive = entity.IsActive,
            IsAvailableForSale = entity.IsAvailableForSale,
            CreatedAt = entity.CreatedAt
        };
    }
}

/// <summary>
/// Create DTO for SalesProduct
/// </summary>
public record CreateSalesProductDto
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
/// Update DTO for SalesProduct
/// </summary>
public record UpdateSalesProductDto
{
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
/// Stock adjustment DTO for SalesProduct
/// </summary>
public record AdjustStockDto
{
    public decimal Quantity { get; init; }
    public string Reason { get; init; } = string.Empty;
}
