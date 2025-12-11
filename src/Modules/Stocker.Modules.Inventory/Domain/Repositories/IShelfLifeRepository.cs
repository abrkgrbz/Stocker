using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for ShelfLife entity
/// </summary>
public interface IShelfLifeRepository : IInventoryRepository<ShelfLife>
{
    /// <summary>
    /// Gets shelf life configuration by ID
    /// </summary>
    Task<ShelfLife?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets shelf life configuration by product
    /// </summary>
    Task<ShelfLife?> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active shelf life configurations
    /// </summary>
    Task<IReadOnlyList<ShelfLife>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets shelf life configurations requiring special storage
    /// </summary>
    Task<IReadOnlyList<ShelfLife>> GetRequiringSpecialStorageAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets shelf life configurations by zone type requirement
    /// </summary>
    Task<IReadOnlyList<ShelfLife>> GetByRequiredZoneTypeAsync(ZoneType zoneType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if product already has shelf life configuration
    /// </summary>
    Task<bool> ExistsForProductAsync(int productId, int? excludeId = null, CancellationToken cancellationToken = default);
}
