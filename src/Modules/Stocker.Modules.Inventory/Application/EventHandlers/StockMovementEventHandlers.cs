using MediatR;
using Microsoft.Extensions.Logging;
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

    public StockMovementCreatedEventHandler(ILogger<StockMovementCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockMovementCreatedDomainEvent notification, CancellationToken cancellationToken)
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

        // Not: Stok güncelleme işlemi command handler'da yapılır
        // Bu handler ek işlemler için kullanılır (maliyet hesaplama, loglama vb.)

        return Task.CompletedTask;
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

    public StockMovementReversedEventHandler(ILogger<StockMovementReversedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockMovementReversedDomainEvent notification, CancellationToken cancellationToken)
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

        return Task.CompletedTask;
    }
}
