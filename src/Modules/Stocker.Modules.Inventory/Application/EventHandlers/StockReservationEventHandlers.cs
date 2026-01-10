using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Stok rezervasyonu oluşturulduğunda çalışan event handler.
/// </summary>
public class StockReservationCreatedEventHandler : INotificationHandler<StockReservationCreatedDomainEvent>
{
    private readonly ILogger<StockReservationCreatedEventHandler> _logger;

    public StockReservationCreatedEventHandler(ILogger<StockReservationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockReservationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock reservation created: {ReservationNumber}, Product: {ProductId}, " +
            "Warehouse: {WarehouseId}, Qty: {Quantity}, Type: {ReservationType}, Expires: {ExpirationDate}",
            notification.ReservationNumber,
            notification.ProductId,
            notification.WarehouseId,
            notification.Quantity,
            notification.ReservationType,
            notification.ExpirationDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu karşılandığında çalışan event handler.
/// - Stok düşer
/// - Stok hareketi oluşturur
/// </summary>
public class StockReservationFulfilledEventHandler : INotificationHandler<StockReservationFulfilledDomainEvent>
{
    private readonly ILogger<StockReservationFulfilledEventHandler> _logger;

    public StockReservationFulfilledEventHandler(ILogger<StockReservationFulfilledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockReservationFulfilledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock reservation fulfilled: {ReservationNumber}, Product: {ProductId}, " +
            "Warehouse: {WarehouseId}, Qty: {FulfilledQuantity}",
            notification.ReservationNumber,
            notification.ProductId,
            notification.WarehouseId,
            notification.FulfilledQuantity);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu kısmen karşılandığında çalışan event handler.
/// </summary>
public class StockReservationPartiallyFulfilledEventHandler : INotificationHandler<StockReservationPartiallyFulfilledDomainEvent>
{
    private readonly ILogger<StockReservationPartiallyFulfilledEventHandler> _logger;

    public StockReservationPartiallyFulfilledEventHandler(ILogger<StockReservationPartiallyFulfilledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockReservationPartiallyFulfilledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock reservation partially fulfilled: {ReservationNumber}, Product: {ProductId}, " +
            "This: {FulfilledQuantity}, Total: {TotalFulfilledQuantity}, Remaining: {RemainingQuantity}",
            notification.ReservationNumber,
            notification.ProductId,
            notification.FulfilledQuantity,
            notification.TotalFulfilledQuantity,
            notification.RemainingQuantity);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu iptal edildiğinde çalışan event handler.
/// - Stok serbest bırakılır
/// </summary>
public class StockReservationCancelledEventHandler : INotificationHandler<StockReservationCancelledDomainEvent>
{
    private readonly ILogger<StockReservationCancelledEventHandler> _logger;

    public StockReservationCancelledEventHandler(ILogger<StockReservationCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockReservationCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stock reservation cancelled: {ReservationNumber}, Product: {ProductId}, " +
            "Warehouse: {WarehouseId}, Qty: {CancelledQuantity}, By: {CancelledBy}",
            notification.ReservationNumber,
            notification.ProductId,
            notification.WarehouseId,
            notification.CancelledQuantity,
            notification.CancelledBy);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu süre dolduğunda çalışan event handler.
/// - Stok serbest bırakılır
/// - Bildirim gönderilir
/// </summary>
public class StockReservationExpiredEventHandler : INotificationHandler<StockReservationExpiredDomainEvent>
{
    private readonly ILogger<StockReservationExpiredEventHandler> _logger;

    public StockReservationExpiredEventHandler(ILogger<StockReservationExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockReservationExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stock reservation expired: {ReservationNumber}, Product: {ProductId}, " +
            "Warehouse: {WarehouseId}, Qty: {ExpiredQuantity}",
            notification.ReservationNumber,
            notification.ProductId,
            notification.WarehouseId,
            notification.ExpiredQuantity);

        // TODO: Bildirim gönder
        // await _notificationService.SendReservationExpiredAlertAsync(notification, cancellationToken);

        return Task.CompletedTask;
    }
}
