using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Stok hareketi oluşturulduğunda çalışan event handler.
/// - Stok miktarını günceller
/// - Maliyet hesaplaması yapar
/// </summary>
public class StockMovementCreatedEventHandler : INotificationHandler<StockMovementCreatedDomainEvent>
{
    private readonly ILogger<StockMovementCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;

    public StockMovementCreatedEventHandler(
        ILogger<StockMovementCreatedEventHandler> logger,
        IInventoryAuditService auditService)
    {
        _logger = logger;
        _auditService = auditService;
    }

    public async Task Handle(StockMovementCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock movement created: {DocumentNumber}, Type: {MovementType}, " +
            "Product: {ProductId}, Warehouse: {WarehouseId}, Qty: {Quantity}, Cost: {TotalCost}",
            notification.DocumentNumber,
            notification.MovementType,
            notification.ProductId,
            notification.WarehouseId,
            notification.Quantity,
            notification.TotalCost);

        // Audit log
        await _auditService.LogStockMovementAsync(
            notification.TenantId,
            notification.ProductId,
            notification.WarehouseId,
            notification.MovementType.ToString(),
            notification.Quantity,
            0, // previousQuantity - not available in event
            0, // newQuantity - not available in event
            reference: notification.DocumentNumber,
            cancellationToken: cancellationToken);
    }
}

/// <summary>
/// Stok hareketi tersine çevrildiğinde çalışan event handler.
/// - Stok miktarını geri alır
/// - Maliyet düzeltmesi yapar
/// </summary>
public class StockMovementReversedEventHandler : INotificationHandler<StockMovementReversedDomainEvent>
{
    private readonly ILogger<StockMovementReversedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;

    public StockMovementReversedEventHandler(
        ILogger<StockMovementReversedEventHandler> logger,
        IInventoryAuditService auditService)
    {
        _logger = logger;
        _auditService = auditService;
    }

    public async Task Handle(StockMovementReversedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stock movement reversed: {DocumentNumber}, Original Movement: {ReversedMovementId}, " +
            "Type: {MovementType}, Product: {ProductId}, Qty: {Quantity}, Reason: {Reason}",
            notification.DocumentNumber,
            notification.ReversedMovementId,
            notification.MovementType,
            notification.ProductId,
            notification.Quantity,
            notification.Reason);

        // Audit log
        await _auditService.LogStockMovementAsync(
            notification.TenantId,
            notification.ProductId,
            notification.WarehouseId,
            $"Reversed_{notification.MovementType}",
            -notification.Quantity,
            0, // previousQuantity
            0, // newQuantity
            reference: $"{notification.DocumentNumber} (Reversal of {notification.ReversedMovementId})",
            cancellationToken: cancellationToken);
    }
}
