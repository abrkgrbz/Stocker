namespace Stocker.Modules.Inventory.Application.Contracts;

/// <summary>
/// Service for inventory stock operations.
/// </summary>
public interface IInventoryStockService
{
    /// <summary>
    /// Applies stock adjustments from a completed stock count.
    /// </summary>
    Task ApplyStockCountAdjustmentsAsync(
        Guid tenantId,
        int stockCountId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates stock levels for a product.
    /// </summary>
    Task RecalculateStockLevelsAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reserves stock for an order.
    /// </summary>
    Task<bool> ReserveStockAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        decimal quantity,
        string reference,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Releases reserved stock.
    /// </summary>
    Task ReleaseReservedStockAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        decimal quantity,
        string reference,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks and triggers low stock alerts.
    /// </summary>
    Task CheckLowStockAlertsAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates product average cost based on new purchase.
    /// </summary>
    Task UpdateProductAverageCostAsync(
        Guid tenantId,
        int productId,
        decimal purchaseQuantity,
        decimal purchaseCost,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes lot batch consumption using FIFO/FEFO strategy.
    /// </summary>
    Task ProcessLotBatchConsumptionAsync(
        Guid tenantId,
        int productId,
        decimal quantity,
        string strategy, // FIFO, FEFO
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Quarantines expired lot batches.
    /// </summary>
    Task QuarantineExpiredLotBatchesAsync(
        Guid tenantId,
        int lotBatchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Initiates quality check process for returned serial number.
    /// </summary>
    Task InitiateQualityCheckAsync(
        Guid tenantId,
        int serialNumberId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates inventory loss report for lost serial number.
    /// </summary>
    Task CreateInventoryLossReportAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string? reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies stock adjustments from a completed cycle count.
    /// </summary>
    Task ApplyCycleCountAdjustmentsAsync(
        Guid tenantId,
        int cycleCountId,
        CancellationToken cancellationToken = default);
}
