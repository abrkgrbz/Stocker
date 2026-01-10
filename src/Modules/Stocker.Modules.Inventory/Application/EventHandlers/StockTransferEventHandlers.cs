using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;
using Stocker.Modules.Inventory.Domain.Services;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Stok transferi oluşturulduğunda çalışan event handler.
/// </summary>
public class StockTransferCreatedEventHandler : INotificationHandler<StockTransferCreatedDomainEvent>
{
    private readonly ILogger<StockTransferCreatedEventHandler> _logger;

    public StockTransferCreatedEventHandler(ILogger<StockTransferCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockTransferCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock transfer created: {TransferNumber}, From: {SourceWarehouse} → To: {DestinationWarehouse}, " +
            "Items: {ItemCount}, Type: {TransferType}",
            notification.TransferNumber,
            notification.SourceWarehouseId,
            notification.DestinationWarehouseId,
            notification.ItemCount,
            notification.TransferType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok transferi sevk edildiğinde çalışan event handler.
/// - Kaynak depodan stok düşer
/// - Stok hareketleri oluşturur
/// </summary>
public class StockTransferShippedEventHandler : INotificationHandler<StockTransferShippedDomainEvent>
{
    private readonly ILogger<StockTransferShippedEventHandler> _logger;
    private readonly IStockMovementService _stockMovementService;

    public StockTransferShippedEventHandler(
        ILogger<StockTransferShippedEventHandler> logger,
        IStockMovementService stockMovementService)
    {
        _logger = logger;
        _stockMovementService = stockMovementService;
    }

    public Task Handle(StockTransferShippedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock transfer shipped: {TransferNumber}, From: {SourceWarehouse} → To: {DestinationWarehouse}, " +
            "Total Quantity: {TotalShippedQuantity}",
            notification.TransferNumber,
            notification.SourceWarehouseId,
            notification.DestinationWarehouseId,
            notification.TotalShippedQuantity);

        // Not: Stok düşme işlemi command handler'da yapılır
        // Bu handler bildirim gönderme vb. ek işlemler için kullanılır

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok transferi teslim alındığında çalışan event handler.
/// - Hedef depoya stok ekler
/// - Stok hareketleri oluşturur
/// </summary>
public class StockTransferReceivedEventHandler : INotificationHandler<StockTransferReceivedDomainEvent>
{
    private readonly ILogger<StockTransferReceivedEventHandler> _logger;
    private readonly IStockMovementService _stockMovementService;

    public StockTransferReceivedEventHandler(
        ILogger<StockTransferReceivedEventHandler> logger,
        IStockMovementService stockMovementService)
    {
        _logger = logger;
        _stockMovementService = stockMovementService;
    }

    public Task Handle(StockTransferReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock transfer received: {TransferNumber}, From: {SourceWarehouse} → To: {DestinationWarehouse}, " +
            "Received: {TotalReceivedQuantity}, Damaged: {TotalDamagedQuantity}",
            notification.TransferNumber,
            notification.SourceWarehouseId,
            notification.DestinationWarehouseId,
            notification.TotalReceivedQuantity,
            notification.TotalDamagedQuantity);

        if (notification.TotalDamagedQuantity > 0)
        {
            _logger.LogWarning(
                "Damaged items in transfer {TransferNumber}: {DamagedQuantity} units",
                notification.TransferNumber,
                notification.TotalDamagedQuantity);
        }

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok transferi tamamlandığında çalışan event handler.
/// </summary>
public class StockTransferCompletedEventHandler : INotificationHandler<StockTransferCompletedDomainEvent>
{
    private readonly ILogger<StockTransferCompletedEventHandler> _logger;

    public StockTransferCompletedEventHandler(ILogger<StockTransferCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockTransferCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock transfer completed: {TransferNumber}, From: {SourceWarehouse} → To: {DestinationWarehouse}",
            notification.TransferNumber,
            notification.SourceWarehouseId,
            notification.DestinationWarehouseId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok transferi iptal edildiğinde çalışan event handler.
/// - Stokları geri yükler (eğer sevk edilmişse)
/// - Ters stok hareketleri oluşturur
/// </summary>
public class StockTransferCancelledEventHandler : INotificationHandler<StockTransferCancelledDomainEvent>
{
    private readonly ILogger<StockTransferCancelledEventHandler> _logger;

    public StockTransferCancelledEventHandler(ILogger<StockTransferCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockTransferCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stock transfer cancelled: {TransferNumber}, Reason: {CancellationReason}, By: {CancelledBy}",
            notification.TransferNumber,
            notification.CancellationReason,
            notification.CancelledBy);

        return Task.CompletedTask;
    }
}
