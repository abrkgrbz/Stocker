using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Location entity
/// </summary>
public interface ILocationRepository : IInventoryRepository<Location>
{
    /// <summary>
    /// Gets locations by warehouse
    /// </summary>
    Task<IReadOnlyList<Location>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a location by code within a warehouse
    /// </summary>
    Task<Location?> GetByCodeAsync(int warehouseId, string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active locations by warehouse
    /// </summary>
    Task<IReadOnlyList<Location>> GetActiveByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a location with the given code exists in the warehouse
    /// </summary>
    Task<bool> ExistsWithCodeAsync(int warehouseId, string code, int? excludeLocationId = null, CancellationToken cancellationToken = default);
}
