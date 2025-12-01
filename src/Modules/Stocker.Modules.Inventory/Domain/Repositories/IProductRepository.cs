using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Product entity
/// </summary>
public interface IProductRepository : IInventoryRepository<Product>
{
    /// <summary>
    /// Gets a product with all related data
    /// </summary>
    Task<Product?> GetWithDetailsAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a product by code
    /// </summary>
    Task<Product?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a product by barcode
    /// </summary>
    Task<Product?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets products by category
    /// </summary>
    Task<IReadOnlyList<Product>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets products by brand
    /// </summary>
    Task<IReadOnlyList<Product>> GetByBrandAsync(int brandId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets products by supplier
    /// </summary>
    Task<IReadOnlyList<Product>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active products
    /// </summary>
    Task<IReadOnlyList<Product>> GetActiveProductsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets products with low stock (below reorder point)
    /// </summary>
    Task<IReadOnlyList<Product>> GetLowStockProductsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches products by name, code, or barcode
    /// </summary>
    Task<IReadOnlyList<Product>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a product with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeProductId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a product with the given barcode exists
    /// </summary>
    Task<bool> ExistsWithBarcodeAsync(string barcode, int? excludeProductId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of products in a category
    /// </summary>
    Task<int> GetCountByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
}
