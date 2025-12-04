using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for ProductVariant entity
/// </summary>
public interface IProductVariantRepository : IInventoryRepository<ProductVariant>
{
    /// <summary>
    /// Gets a product variant with its options
    /// </summary>
    Task<ProductVariant?> GetWithOptionsAsync(int variantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all variants for a product
    /// </summary>
    Task<IReadOnlyList<ProductVariant>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a variant by SKU
    /// </summary>
    Task<ProductVariant?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a variant by barcode
    /// </summary>
    Task<ProductVariant?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active variants for a product
    /// </summary>
    Task<IReadOnlyList<ProductVariant>> GetActiveVariantsAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the default variant for a product
    /// </summary>
    Task<ProductVariant?> GetDefaultVariantAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a variant with the given SKU exists
    /// </summary>
    Task<bool> ExistsWithSkuAsync(string sku, int? excludeVariantId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a variant with the given barcode exists
    /// </summary>
    Task<bool> ExistsWithBarcodeAsync(string barcode, int? excludeVariantId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets variant options for a variant
    /// </summary>
    Task<IReadOnlyList<ProductVariantOption>> GetVariantOptionsAsync(int variantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds an option to a variant
    /// </summary>
    Task<ProductVariantOption> AddVariantOptionAsync(ProductVariantOption option, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a variant option
    /// </summary>
    void RemoveVariantOption(ProductVariantOption option);
}
