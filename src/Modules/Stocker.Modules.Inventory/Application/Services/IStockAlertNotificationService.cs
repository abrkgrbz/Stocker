namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Interface for sending real-time stock alert notifications
/// </summary>
public interface IStockAlertNotificationService
{
    /// <summary>
    /// Notify when stock level falls below minimum threshold
    /// </summary>
    Task NotifyLowStockAsync(StockAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Notify when product goes out of stock
    /// </summary>
    Task NotifyOutOfStockAsync(StockAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Notify when lot/batch is about to expire
    /// </summary>
    Task NotifyExpiringStockAsync(ExpiringStockAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Notify when lot/batch has expired
    /// </summary>
    Task NotifyExpiredStockAsync(ExpiringStockAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Notify about stock transfer status changes
    /// </summary>
    Task NotifyTransferStatusChangedAsync(TransferStatusAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Notify about stock count pending review
    /// </summary>
    Task NotifyStockCountPendingAsync(StockCountAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Notify about stock adjustment
    /// </summary>
    Task NotifyStockAdjustedAsync(StockAdjustmentAlertDto alert, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send batch alerts for multiple stock issues
    /// </summary>
    Task NotifyBatchAlertsAsync(IEnumerable<StockAlertDto> alerts, CancellationToken cancellationToken = default);
}

#region Alert DTOs

/// <summary>
/// Base stock alert DTO
/// </summary>
public record StockAlertDto
{
    public required string TenantId { get; init; }
    public required int ProductId { get; init; }
    public required string ProductCode { get; init; }
    public required string ProductName { get; init; }
    public required int WarehouseId { get; init; }
    public required string WarehouseName { get; init; }
    public required decimal CurrentStock { get; init; }
    public required decimal MinStockLevel { get; init; }
    public required decimal ReorderPoint { get; init; }
    public StockAlertSeverity Severity { get; init; } = StockAlertSeverity.Warning;
    public string? Message { get; init; }
}

/// <summary>
/// Expiring stock alert DTO
/// </summary>
public record ExpiringStockAlertDto
{
    public required string TenantId { get; init; }
    public required int LotBatchId { get; init; }
    public required string LotNumber { get; init; }
    public required int ProductId { get; init; }
    public required string ProductCode { get; init; }
    public required string ProductName { get; init; }
    public required decimal Quantity { get; init; }
    public required DateTime ExpiryDate { get; init; }
    public required int DaysUntilExpiry { get; init; }
    public StockAlertSeverity Severity { get; init; } = StockAlertSeverity.Warning;
    public string? Message { get; init; }
}

/// <summary>
/// Transfer status alert DTO
/// </summary>
public record TransferStatusAlertDto
{
    public required string TenantId { get; init; }
    public required int TransferId { get; init; }
    public required string TransferNumber { get; init; }
    public required string FromWarehouse { get; init; }
    public required string ToWarehouse { get; init; }
    public required string OldStatus { get; init; }
    public required string NewStatus { get; init; }
    public required int ItemCount { get; init; }
    public string? Message { get; init; }
}

/// <summary>
/// Stock count alert DTO
/// </summary>
public record StockCountAlertDto
{
    public required string TenantId { get; init; }
    public required int StockCountId { get; init; }
    public required string CountNumber { get; init; }
    public required string WarehouseName { get; init; }
    public required string Status { get; init; }
    public required int ItemCount { get; init; }
    public required int DiscrepancyCount { get; init; }
    public string? Message { get; init; }
}

/// <summary>
/// Stock adjustment alert DTO
/// </summary>
public record StockAdjustmentAlertDto
{
    public required string TenantId { get; init; }
    public required int ProductId { get; init; }
    public required string ProductCode { get; init; }
    public required string ProductName { get; init; }
    public required int WarehouseId { get; init; }
    public required string WarehouseName { get; init; }
    public required decimal OldQuantity { get; init; }
    public required decimal NewQuantity { get; init; }
    public required decimal AdjustmentQuantity { get; init; }
    public required string AdjustmentType { get; init; }
    public required string Reason { get; init; }
    public string? AdjustedBy { get; init; }
}

/// <summary>
/// Stock alert severity levels
/// </summary>
public enum StockAlertSeverity
{
    Info,
    Warning,
    Critical
}

#endregion
