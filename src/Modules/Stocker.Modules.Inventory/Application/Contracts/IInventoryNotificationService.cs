namespace Stocker.Modules.Inventory.Application.Contracts;

/// <summary>
/// Service for sending inventory-related notifications.
/// </summary>
public interface IInventoryNotificationService
{
    /// <summary>
    /// Sends low stock alert notification.
    /// </summary>
    Task SendLowStockAlertAsync(
        Guid tenantId,
        int productId,
        string productName,
        string productCode,
        int warehouseId,
        string warehouseName,
        decimal currentQuantity,
        decimal minimumQuantity,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends stock count completion notification.
    /// </summary>
    Task SendStockCountCompletedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        int totalProducts,
        int discrepancies,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends stock count approval notification.
    /// </summary>
    Task SendStockCountApprovedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends stock count rejection notification.
    /// </summary>
    Task SendStockCountRejectedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        string rejectedBy,
        string? reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends lot/batch expiration warning notification.
    /// </summary>
    Task SendLotBatchExpiringAlertAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string productName,
        DateTime expiryDate,
        int daysUntilExpiry,
        decimal remainingQuantity,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends lot/batch expired notification.
    /// </summary>
    Task SendLotBatchExpiredAlertAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string productName,
        DateTime expiryDate,
        decimal remainingQuantity,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends lot/batch quarantine notification.
    /// </summary>
    Task SendLotBatchQuarantinedAlertAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string productName,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends serial number defective notification.
    /// </summary>
    Task SendSerialNumberDefectiveAlertAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string productName,
        string? reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends serial number lost notification.
    /// </summary>
    Task SendSerialNumberLostAlertAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string productName,
        string? reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends price list update notification.
    /// </summary>
    Task SendPriceListUpdatedAsync(
        Guid tenantId,
        int priceListId,
        string priceListCode,
        string priceListName,
        int itemsAffected,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends stock adjustment notification.
    /// </summary>
    Task SendStockAdjustmentAppliedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        decimal totalDifference,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends cycle count completion notification.
    /// </summary>
    Task SendCycleCountCompletedAsync(
        Guid tenantId,
        int cycleCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        int categoryId,
        string categoryName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies about a scheduled stock count.
    /// </summary>
    Task NotifyStockCountScheduledAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        DateTime scheduledDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies when stock count has started.
    /// </summary>
    Task NotifyStockCountStartedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies about stock count completion.
    /// </summary>
    Task NotifyStockCountCompletedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int itemsWithVariance,
        decimal? accuracyPercent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies about stock count approval.
    /// </summary>
    Task NotifyStockCountApprovedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Notifies about stock count cancellation.
    /// </summary>
    Task NotifyStockCountCancelledAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        string reason,
        CancellationToken cancellationToken = default);
}
