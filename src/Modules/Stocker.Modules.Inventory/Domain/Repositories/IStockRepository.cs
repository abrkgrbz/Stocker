using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Stock entity
/// </summary>
public interface IStockRepository : IInventoryRepository<Stock>
{
    /// <summary>
    /// Gets stock for a product in a specific warehouse
    /// </summary>
    Task<Stock?> GetByProductAndWarehouseAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets stock for a product in a specific location
    /// </summary>
    Task<Stock?> GetByProductAndLocationAsync(int productId, int warehouseId, int? locationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all stocks for a product
    /// </summary>
    Task<IReadOnlyList<Stock>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all stocks in a warehouse
    /// </summary>
    Task<IReadOnlyList<Stock>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all stocks in a location
    /// </summary>
    Task<IReadOnlyList<Stock>> GetByLocationAsync(int locationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total available quantity for a product in a specific warehouse
    /// </summary>
    Task<decimal> GetTotalAvailableQuantityAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total quantity for a product across all warehouses
    /// </summary>
    Task<decimal> GetTotalQuantityByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets stocks with negative quantity
    /// </summary>
    Task<IReadOnlyList<Stock>> GetNegativeStocksAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets stocks with low quantity
    /// </summary>
    Task<IReadOnlyList<Stock>> GetLowStockItemsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets stocks that are expiring within specified days
    /// </summary>
    Task<IReadOnlyList<Stock>> GetExpiringStocksAsync(int withinDays, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets stocks by lot number
    /// </summary>
    Task<IReadOnlyList<Stock>> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets stock by serial number
    /// </summary>
    Task<Stock?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a product has any stock records
    /// </summary>
    Task<bool> HasStockAsync(int productId, CancellationToken cancellationToken = default);
}
