namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Service for sales-specific audit logging.
/// Kritik satış işlemlerinin (sipariş oluşturma, durum değişikliği, iptal) detaylı audit log kaydı.
/// </summary>
public interface ISalesAuditService
{
    /// <summary>
    /// Sipariş oluşturma olayını loglar.
    /// </summary>
    Task LogOrderCreatedAsync(
        Guid orderId,
        string orderNumber,
        string customerName,
        decimal totalAmount,
        int itemCount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş güncelleme olayını loglar.
    /// </summary>
    Task LogOrderUpdatedAsync(
        Guid orderId,
        string orderNumber,
        object? oldValues,
        object? newValues,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş durumu değişikliğini loglar.
    /// </summary>
    Task LogOrderStatusChangedAsync(
        Guid orderId,
        string orderNumber,
        string previousStatus,
        string newStatus,
        string? reason = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş onaylama olayını loglar.
    /// </summary>
    Task LogOrderApprovedAsync(
        Guid orderId,
        string orderNumber,
        Guid approvedByUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş iptal olayını loglar.
    /// </summary>
    Task LogOrderCancelledAsync(
        Guid orderId,
        string orderNumber,
        string? cancellationReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş silme olayını loglar.
    /// </summary>
    Task LogOrderDeletedAsync(
        Guid orderId,
        string orderNumber,
        string status,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş kalemi ekleme olayını loglar.
    /// </summary>
    Task LogOrderItemAddedAsync(
        Guid orderId,
        string orderNumber,
        string productName,
        decimal quantity,
        decimal unitPrice,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sipariş kalemi silme olayını loglar.
    /// </summary>
    Task LogOrderItemRemovedAsync(
        Guid orderId,
        string orderNumber,
        Guid itemId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Genel bir satış audit olayını loglar.
    /// </summary>
    Task LogAsync(
        string entityType,
        string entityId,
        string action,
        object? oldValues = null,
        object? newValues = null,
        string? additionalData = null,
        CancellationToken cancellationToken = default);
}
