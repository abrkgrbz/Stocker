using Stocker.Modules.Inventory.Application.DTOs;

namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Service interface for barcode generation and lookup operations
/// </summary>
public interface IBarcodeService
{
    /// <summary>
    /// Generate a barcode image
    /// </summary>
    Task<GenerateBarcodeResponse> GenerateBarcodeAsync(GenerateBarcodeRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generate a product label with barcode
    /// </summary>
    Task<GenerateProductLabelResponse> GenerateProductLabelAsync(GenerateProductLabelRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generate multiple product labels (bulk)
    /// </summary>
    Task<BulkLabelGenerationResponse> GenerateBulkLabelsAsync(BulkLabelGenerationRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lookup product/variant/serial by barcode
    /// </summary>
    Task<BarcodeLookupResponse> LookupBarcodeAsync(BarcodeLookupRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Auto-generate a unique barcode for a product
    /// </summary>
    Task<AutoGenerateBarcodeResponse> AutoGenerateBarcodeAsync(AutoGenerateBarcodeRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate barcode format and checksum
    /// </summary>
    Task<(bool IsValid, string? ErrorMessage)> ValidateBarcodeAsync(string barcode, BarcodeFormat format, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if barcode is unique across products
    /// </summary>
    Task<(bool IsUnique, string? ConflictingProductCode)> CheckBarcodeUniqueAsync(string barcode, int? excludeProductId = null, CancellationToken cancellationToken = default);
}
