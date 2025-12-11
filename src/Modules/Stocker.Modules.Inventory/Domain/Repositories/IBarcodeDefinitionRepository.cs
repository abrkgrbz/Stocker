using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for BarcodeDefinition entity
/// </summary>
public interface IBarcodeDefinitionRepository : IInventoryRepository<BarcodeDefinition>
{
    /// <summary>
    /// Gets a barcode definition by ID with related data
    /// </summary>
    Task<BarcodeDefinition?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets barcode definition by barcode value
    /// </summary>
    Task<BarcodeDefinition?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets barcode definitions by product
    /// </summary>
    Task<IReadOnlyList<BarcodeDefinition>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets barcode definitions by product variant
    /// </summary>
    Task<IReadOnlyList<BarcodeDefinition>> GetByProductVariantAsync(int productVariantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets primary barcode for a product
    /// </summary>
    Task<BarcodeDefinition?> GetPrimaryBarcodeAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active barcode definitions
    /// </summary>
    Task<IReadOnlyList<BarcodeDefinition>> GetActiveBarcodesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if barcode exists
    /// </summary>
    Task<bool> ExistsWithBarcodeAsync(string barcode, int? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches barcodes by value
    /// </summary>
    Task<IReadOnlyList<BarcodeDefinition>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active barcode definitions
    /// </summary>
    Task<IReadOnlyList<BarcodeDefinition>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets barcode definition by barcode value (alias for GetByBarcodeAsync)
    /// </summary>
    Task<BarcodeDefinition?> GetByBarcodeValueAsync(string barcodeValue, CancellationToken cancellationToken = default);
}
