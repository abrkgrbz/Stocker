using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for StockCount entity
/// </summary>
public interface IStockCountRepository : IInventoryRepository<StockCount>
{
    /// <summary>
    /// Gets a count with items
    /// </summary>
    Task<StockCount?> GetWithItemsAsync(int countId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a count by count number
    /// </summary>
    Task<StockCount?> GetByCountNumberAsync(string countNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets counts by status
    /// </summary>
    Task<IReadOnlyList<StockCount>> GetByStatusAsync(StockCountStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets counts by warehouse
    /// </summary>
    Task<IReadOnlyList<StockCount>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets counts by date range
    /// </summary>
    Task<IReadOnlyList<StockCount>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets counts pending approval
    /// </summary>
    Task<IReadOnlyList<StockCount>> GetPendingApprovalsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets counts with discrepancies
    /// </summary>
    Task<IReadOnlyList<StockCount>> GetCountsWithDiscrepanciesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique count number
    /// </summary>
    Task<string> GenerateCountNumberAsync(CancellationToken cancellationToken = default);
}
