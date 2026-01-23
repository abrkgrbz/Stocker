using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for StockTransfer entity
/// </summary>
public interface IStockTransferRepository : IInventoryRepository<StockTransfer>
{
    /// <summary>
    /// Gets a transfer with items
    /// </summary>
    Task<StockTransfer?> GetWithItemsAsync(int transferId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a transfer by transfer number
    /// </summary>
    Task<StockTransfer?> GetByTransferNumberAsync(string transferNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets transfers by status
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetByStatusAsync(TransferStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets transfers from a source warehouse
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetBySourceWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets transfers to a destination warehouse
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetByDestinationWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets transfers by date range
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending transfers requiring approval
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique transfer number
    /// </summary>
    Task<string> GenerateTransferNumberAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all transfers involving a warehouse (as source or destination)
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets InTransit transfers that are overdue (past expected arrival or shipped too long ago)
    /// </summary>
    Task<IReadOnlyList<StockTransfer>> GetOverdueInTransitAsync(TimeSpan maxTransitDuration, CancellationToken cancellationToken = default);
}
