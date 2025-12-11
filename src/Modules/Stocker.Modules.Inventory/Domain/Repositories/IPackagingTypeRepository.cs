using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for PackagingType entity
/// </summary>
public interface IPackagingTypeRepository : IInventoryRepository<PackagingType>
{
    /// <summary>
    /// Gets a packaging type by ID
    /// </summary>
    Task<PackagingType?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets packaging type by code
    /// </summary>
    Task<PackagingType?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active packaging types
    /// </summary>
    Task<IReadOnlyList<PackagingType>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets packaging types by category
    /// </summary>
    Task<IReadOnlyList<PackagingType>> GetByCategoryAsync(PackagingCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if packaging type with code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches packaging types by name or code
    /// </summary>
    Task<IReadOnlyList<PackagingType>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
}
