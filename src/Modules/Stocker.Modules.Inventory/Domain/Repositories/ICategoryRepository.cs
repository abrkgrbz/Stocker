using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Category entity
/// </summary>
public interface ICategoryRepository : IInventoryRepository<Category>
{
    /// <summary>
    /// Gets a category with its subcategories
    /// </summary>
    Task<Category?> GetWithSubCategoriesAsync(int categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a category with its products
    /// </summary>
    Task<Category?> GetWithProductsAsync(int categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a category by code
    /// </summary>
    Task<Category?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets root categories (no parent)
    /// </summary>
    Task<IReadOnlyList<Category>> GetRootCategoriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets subcategories of a category
    /// </summary>
    Task<IReadOnlyList<Category>> GetSubCategoriesAsync(int parentCategoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the full category tree
    /// </summary>
    Task<IReadOnlyList<Category>> GetCategoryTreeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a category with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeCategoryId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a category has any products
    /// </summary>
    Task<bool> HasProductsAsync(int categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a category has any subcategories
    /// </summary>
    Task<bool> HasSubcategoriesAsync(int categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a category has any active products
    /// </summary>
    Task<bool> HasActiveProductsAsync(int categoryId, CancellationToken cancellationToken = default);
}
