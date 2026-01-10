using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Stok düzeltmesi oluşturulduğunda çalışan event handler.
/// </summary>
public class InventoryAdjustmentCreatedEventHandler : INotificationHandler<InventoryAdjustmentCreatedDomainEvent>
{
    private readonly ILogger<InventoryAdjustmentCreatedEventHandler> _logger;

    public InventoryAdjustmentCreatedEventHandler(ILogger<InventoryAdjustmentCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryAdjustmentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Inventory adjustment created: {AdjustmentNumber}, Type: {AdjustmentType}, " +
            "Warehouse: {WarehouseId}, Items: {ItemCount}, Cost Impact: {TotalCostImpact}",
            notification.AdjustmentNumber,
            notification.AdjustmentType,
            notification.WarehouseId,
            notification.ItemCount,
            notification.TotalCostImpact);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok düzeltmesi onaylandığında çalışan event handler.
/// </summary>
public class InventoryAdjustmentApprovedEventHandler : INotificationHandler<InventoryAdjustmentApprovedDomainEvent>
{
    private readonly ILogger<InventoryAdjustmentApprovedEventHandler> _logger;

    public InventoryAdjustmentApprovedEventHandler(ILogger<InventoryAdjustmentApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryAdjustmentApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Inventory adjustment approved: {AdjustmentNumber}, By: {ApprovedBy}, Cost Impact: {TotalCostImpact}",
            notification.AdjustmentNumber,
            notification.ApprovedBy,
            notification.TotalCostImpact);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok düzeltmesi işlendiğinde çalışan event handler.
/// - Stok miktarlarını günceller
/// - Stok hareketleri oluşturur
/// </summary>
public class InventoryAdjustmentProcessedEventHandler : INotificationHandler<InventoryAdjustmentProcessedDomainEvent>
{
    private readonly ILogger<InventoryAdjustmentProcessedEventHandler> _logger;

    public InventoryAdjustmentProcessedEventHandler(ILogger<InventoryAdjustmentProcessedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryAdjustmentProcessedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Inventory adjustment processed: {AdjustmentNumber}, Warehouse: {WarehouseId}, " +
            "Items: {ItemCount}, Positive: {TotalPositive}, Negative: {TotalNegative}, Net Cost: {TotalCostImpact}",
            notification.AdjustmentNumber,
            notification.WarehouseId,
            notification.ItemCount,
            notification.TotalPositiveAdjustment,
            notification.TotalNegativeAdjustment,
            notification.TotalCostImpact);

        // TODO: Muhasebe entegrasyonu
        // await _accountingService.CreateInventoryAdjustmentEntryAsync(notification, cancellationToken);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok düzeltmesi reddedildiğinde çalışan event handler.
/// </summary>
public class InventoryAdjustmentRejectedEventHandler : INotificationHandler<InventoryAdjustmentRejectedDomainEvent>
{
    private readonly ILogger<InventoryAdjustmentRejectedEventHandler> _logger;

    public InventoryAdjustmentRejectedEventHandler(ILogger<InventoryAdjustmentRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryAdjustmentRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Inventory adjustment rejected: {AdjustmentNumber}, By: {RejectedBy}, Reason: {RejectionReason}",
            notification.AdjustmentNumber,
            notification.RejectedBy,
            notification.RejectionReason);

        // TODO: Bildirim gönder
        // await _notificationService.SendAdjustmentRejectedNotificationAsync(notification, cancellationToken);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok düzeltmesi iptal edildiğinde çalışan event handler.
/// </summary>
public class InventoryAdjustmentCancelledEventHandler : INotificationHandler<InventoryAdjustmentCancelledDomainEvent>
{
    private readonly ILogger<InventoryAdjustmentCancelledEventHandler> _logger;

    public InventoryAdjustmentCancelledEventHandler(ILogger<InventoryAdjustmentCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryAdjustmentCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Inventory adjustment cancelled: {AdjustmentNumber}, By: {CancelledBy}, Reason: {CancellationReason}",
            notification.AdjustmentNumber,
            notification.CancelledBy,
            notification.CancellationReason);

        return Task.CompletedTask;
    }
}
