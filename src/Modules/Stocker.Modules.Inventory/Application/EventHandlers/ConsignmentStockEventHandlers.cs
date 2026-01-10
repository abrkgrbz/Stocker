using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ConsignmentStock Event Handlers

public class ConsignmentStockCreatedEventHandler : INotificationHandler<ConsignmentStockCreatedDomainEvent>
{
    private readonly ILogger<ConsignmentStockCreatedEventHandler> _logger;

    public ConsignmentStockCreatedEventHandler(ILogger<ConsignmentStockCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentStockCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Consignment stock created: Product {ProductId}, Supplier {SupplierId}, Quantity: {Quantity}",
            notification.ProductId,
            notification.SupplierId,
            notification.Quantity);

        return Task.CompletedTask;
    }
}

public class ConsignmentStockSoldEventHandler : INotificationHandler<ConsignmentStockSoldDomainEvent>
{
    private readonly ILogger<ConsignmentStockSoldEventHandler> _logger;

    public ConsignmentStockSoldEventHandler(ILogger<ConsignmentStockSoldEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentStockSoldDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Consignment stock sold: Product {ProductId}, Quantity: {QuantitySold}, Amount: {SaleAmount}",
            notification.ProductId,
            notification.QuantitySold,
            notification.SaleAmount);

        return Task.CompletedTask;
    }
}

public class ConsignmentStockReturnedEventHandler : INotificationHandler<ConsignmentStockReturnedDomainEvent>
{
    private readonly ILogger<ConsignmentStockReturnedEventHandler> _logger;

    public ConsignmentStockReturnedEventHandler(ILogger<ConsignmentStockReturnedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentStockReturnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Consignment stock returned: Product {ProductId}, Quantity: {QuantityReturned}, Reason: {Reason}",
            notification.ProductId,
            notification.QuantityReturned,
            notification.ReturnReason ?? "Not specified");

        return Task.CompletedTask;
    }
}

public class ConsignmentStockExpiredEventHandler : INotificationHandler<ConsignmentStockExpiredDomainEvent>
{
    private readonly ILogger<ConsignmentStockExpiredEventHandler> _logger;

    public ConsignmentStockExpiredEventHandler(ILogger<ConsignmentStockExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentStockExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Consignment stock expired: Product {ProductId}, Remaining: {RemainingQuantity}, Expiry: {ExpiryDate}",
            notification.ProductId,
            notification.RemainingQuantity,
            notification.ExpiryDate);

        return Task.CompletedTask;
    }
}

#endregion
