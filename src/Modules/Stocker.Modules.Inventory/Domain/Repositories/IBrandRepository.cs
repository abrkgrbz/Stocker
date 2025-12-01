using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Brand entity
/// </summary>
public interface IBrandRepository : IInventoryRepository<Brand>
{
    /// <summary>
    /// Gets a brand with products
    /// </summary>
    Task<Brand?> GetWithProductsAsync(int brandId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a brand by code
    /// </summary>
    Task<Brand?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active brands
    /// </summary>
    Task<IReadOnlyList<Brand>> GetActiveBrandsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches brands by name or code
    /// </summary>
    Task<IReadOnlyList<Brand>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a brand with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeBrandId = null, CancellationToken cancellationToken = default);
}
