using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for InventoryAdjustment entity
/// </summary>
public interface IInventoryAdjustmentRepository : IInventoryRepository<InventoryAdjustment>
{
    /// <summary>
    /// Gets inventory adjustment by ID with items
    /// </summary>
    Task<InventoryAdjustment?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustment by number
    /// </summary>
    Task<InventoryAdjustment?> GetByNumberAsync(string adjustmentNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments by warehouse
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments by status
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetByStatusAsync(AdjustmentStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments by type
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetByTypeAsync(AdjustmentType adjustmentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments by reason
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetByReasonAsync(AdjustmentReason reason, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments pending approval
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments by date range
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets inventory adjustments by stock count
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetByStockCountAsync(int stockCountId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets draft adjustments
    /// </summary>
    Task<IReadOnlyList<InventoryAdjustment>> GetDraftsAsync(CancellationToken cancellationToken = default);
}
