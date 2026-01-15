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
/// </summary>
public record ProductImportRequest(
    Guid TenantId,
    string Code,
    string Name,
    string? Description = null,
    string? Barcode = null,
    string? Sku = null,
    string Unit = "Adet",
    decimal SalePrice = 0,
    decimal CostPrice = 0,
    string Currency = "TRY",
    decimal VatRate = 18,
    string? CategoryCode = null,
    decimal MinimumStock = 0,
    decimal MaximumStock = 0,
    decimal ReorderPoint = 0,
    decimal Weight = 0,
    string WeightUnit = "kg"
);
