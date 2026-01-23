using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for StockMovement entity
/// </summary>
public interface IStockMovementRepository : IInventoryRepository<StockMovement>
{
    /// <summary>
    /// Gets a stock movement with all details including Product, Warehouse, and Locations
    /// </summary>
    Task<StockMovement?> GetWithDetailsAsync(int movementId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets movements by product
    /// </summary>
    Task<IReadOnlyList<StockMovement>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets movements by warehouse
    /// </summary>
    Task<IReadOnlyList<StockMovement>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets movements by date range
    /// </summary>
    Task<IReadOnlyList<StockMovement>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets movements by type
    /// </summary>
    Task<IReadOnlyList<StockMovement>> GetByTypeAsync(StockMovementType movementType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets movements by document number
    /// </summary>
    Task<IReadOnlyList<StockMovement>> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets movements by reference document
    /// </summary>
    Task<IReadOnlyList<StockMovement>> GetByReferenceAsync(string referenceDocumentType, string referenceDocumentNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the last movement for a product
    /// </summary>
    Task<StockMovement?> GetLastMovementAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique document number
    /// </summary>
    Task<string> GenerateDocumentNumberAsync(StockMovementType movementType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the next sequence number for a product+warehouse combination.
    /// Used for clock-skew-independent ordering of stock movements.
    /// </summary>
    Task<long> GetNextSequenceNumberAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);
}
