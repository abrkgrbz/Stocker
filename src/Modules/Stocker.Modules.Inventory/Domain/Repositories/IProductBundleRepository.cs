using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for ProductBundle entity
/// </summary>
public interface IProductBundleRepository : IInventoryRepository<ProductBundle>
{
    /// <summary>
    /// Gets a product bundle with its items
    /// </summary>
    Task<ProductBundle?> GetWithItemsAsync(int bundleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a bundle by code
    /// </summary>
    Task<ProductBundle?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active bundles
    /// </summary>
    Task<IReadOnlyList<ProductBundle>> GetActiveBundlesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets valid bundles (active and within validity period)
    /// </summary>
    Task<IReadOnlyList<ProductBundle>> GetValidBundlesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bundles by type
    /// </summary>
    Task<IReadOnlyList<ProductBundle>> GetByTypeAsync(BundleType bundleType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a bundle with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeBundleId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bundles containing a specific product
    /// </summary>
    Task<IReadOnlyList<ProductBundle>> GetBundlesContainingProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a bundle item by ID
    /// </summary>
    Task<ProductBundleItem?> GetItemByIdAsync(int itemId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds an item to a bundle
    /// </summary>
    Task<ProductBundleItem> AddItemAsync(ProductBundleItem item, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a bundle item
    /// </summary>
    void UpdateItem(ProductBundleItem item);

    /// <summary>
    /// Removes a bundle item
    /// </summary>
    void RemoveItem(ProductBundleItem item);
}
