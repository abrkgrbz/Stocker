namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service interface for importing products into Inventory module.
/// Implemented by Inventory module to decouple Infrastructure from Inventory.
/// </summary>
public interface IProductImportService
{
    /// <summary>
    /// Creates or updates a product in the Inventory module.
    /// </summary>
    /// <param name="request">The product import request containing all product details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The created/updated product ID (int because BaseEntity uses int Id)</returns>
    Task<int> ImportProductAsync(ProductImportRequest request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Request model for product import operations.
/// Maps to Inventory.Domain.Entities.Product
/// </summary>
public record ProductImportRequest(
    // Required fields
    Guid TenantId,
    string Code,
    string Name,

    // Basic info
    string? Description = null,
    string? Barcode = null,
    string? Sku = null,

    // Classification
    string? ProductType = null,          // Raw, SemiFinished, Finished, Service, Consumable, FixedAsset
    string? CategoryCode = null,
    string? BrandCode = null,
    string? SupplierCode = null,

    // Unit & Pricing
    string Unit = "Adet",
    decimal SalePrice = 0,
    decimal CostPrice = 0,
    string Currency = "TRY",
    decimal VatRate = 18,

    // Stock levels
    decimal MinimumStock = 0,
    decimal MaximumStock = 0,
    decimal ReorderPoint = 0,
    decimal ReorderQuantity = 0,
    int LeadTimeDays = 0,

    // Physical properties
    decimal Weight = 0,
    string WeightUnit = "kg",
    decimal Length = 0,
    decimal Width = 0,
    decimal Height = 0,
    string DimensionUnit = "cm",

    // Tracking options
    bool IsActive = true,
    bool IsStockTracked = true,
    bool IsSerialTracked = false,
    bool IsLotTracked = false
);
