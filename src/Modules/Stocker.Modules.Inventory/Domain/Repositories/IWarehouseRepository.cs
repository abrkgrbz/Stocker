using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Warehouse entity
/// </summary>
public interface IWarehouseRepository : IInventoryRepository<Warehouse>
{
    /// <summary>
    /// Gets a warehouse with its locations
    /// </summary>
    Task<Warehouse?> GetWithLocationsAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a warehouse with its stocks
    /// </summary>
    Task<Warehouse?> GetWithStocksAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a warehouse by code
    /// </summary>
    Task<Warehouse?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the default warehouse
    /// </summary>
    Task<Warehouse?> GetDefaultWarehouseAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active warehouses
    /// </summary>
    Task<IReadOnlyList<Warehouse>> GetActiveWarehousesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets warehouses by branch
    /// </summary>
    Task<IReadOnlyList<Warehouse>> GetByBranchAsync(int? branchId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a warehouse with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeWarehouseId = null, CancellationToken cancellationToken = default);
}
