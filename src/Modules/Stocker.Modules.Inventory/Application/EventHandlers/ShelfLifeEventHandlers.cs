using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ShelfLife Event Handlers

public class ShelfLifeDefinedEventHandler : INotificationHandler<ShelfLifeDefinedDomainEvent>
{
    private readonly ILogger<ShelfLifeDefinedEventHandler> _logger;

    public ShelfLifeDefinedEventHandler(ILogger<ShelfLifeDefinedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShelfLifeDefinedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Shelf life defined: Product {ProductId}, Days: {ShelfLifeDays}, Warning at: {WarningDays} days",
            notification.ProductId,
            notification.ShelfLifeDays,
            notification.WarningDays);

        return Task.CompletedTask;
    }
}

public class ShelfLifeWarningTriggeredEventHandler : INotificationHandler<ShelfLifeWarningTriggeredDomainEvent>
{
    private readonly ILogger<ShelfLifeWarningTriggeredEventHandler> _logger;

    public ShelfLifeWarningTriggeredEventHandler(ILogger<ShelfLifeWarningTriggeredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShelfLifeWarningTriggeredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Shelf life warning: {ProductName}, {DaysRemaining} days remaining, Affected Qty: {AffectedQuantity}",
            notification.ProductName,
            notification.DaysRemaining,
            notification.AffectedQuantity);

        return Task.CompletedTask;
    }
}

public class ShelfLifeExpiredEventHandler : INotificationHandler<ShelfLifeExpiredDomainEvent>
{
    private readonly ILogger<ShelfLifeExpiredEventHandler> _logger;

    public ShelfLifeExpiredEventHandler(ILogger<ShelfLifeExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShelfLifeExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogError(
            "Shelf life expired: {ProductName}, Expired Qty: {ExpiredQuantity}, Lot: {LotNumber}",
            notification.ProductName,
            notification.ExpiredQuantity,
            notification.LotNumber ?? "N/A");

        return Task.CompletedTask;
    }
}

public class ExpiredProductDisposedEventHandler : INotificationHandler<ExpiredProductDisposedDomainEvent>
{
    private readonly ILogger<ExpiredProductDisposedEventHandler> _logger;

    public ExpiredProductDisposedEventHandler(ILogger<ExpiredProductDisposedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpiredProductDisposedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Expired product disposed: Product {ProductId}, Qty: {DisposedQuantity}, Method: {DisposalMethod}",
            notification.ProductId,
            notification.DisposedQuantity,
            notification.DisposalMethod);

        return Task.CompletedTask;
    }
}

#endregion
