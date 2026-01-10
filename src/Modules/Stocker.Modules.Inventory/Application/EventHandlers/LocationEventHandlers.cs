using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region Location Event Handlers

public class LocationCreatedEventHandler : INotificationHandler<LocationCreatedDomainEvent>
{
    private readonly ILogger<LocationCreatedEventHandler> _logger;

    public LocationCreatedEventHandler(ILogger<LocationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LocationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Location created: {Code} - {Name} in Warehouse {WarehouseId}",
            notification.Code,
            notification.Name,
            notification.WarehouseId);

        return Task.CompletedTask;
    }
}

public class LocationActivatedEventHandler : INotificationHandler<LocationActivatedDomainEvent>
{
    private readonly ILogger<LocationActivatedEventHandler> _logger;

    public LocationActivatedEventHandler(ILogger<LocationActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LocationActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Location activated: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class LocationDeactivatedEventHandler : INotificationHandler<LocationDeactivatedDomainEvent>
{
    private readonly ILogger<LocationDeactivatedEventHandler> _logger;

    public LocationDeactivatedEventHandler(ILogger<LocationDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LocationDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Location deactivated: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class ProductAssignedToLocationEventHandler : INotificationHandler<ProductAssignedToLocationDomainEvent>
{
    private readonly ILogger<ProductAssignedToLocationEventHandler> _logger;

    public ProductAssignedToLocationEventHandler(ILogger<ProductAssignedToLocationEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductAssignedToLocationDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product {ProductId} assigned to location {LocationCode}, Quantity: {Quantity}",
            notification.ProductId,
            notification.LocationCode,
            notification.Quantity);

        return Task.CompletedTask;
    }
}

#endregion
