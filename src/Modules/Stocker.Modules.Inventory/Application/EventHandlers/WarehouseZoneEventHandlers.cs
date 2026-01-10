using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region WarehouseZone Event Handlers

public class WarehouseZoneCreatedEventHandler : INotificationHandler<WarehouseZoneCreatedDomainEvent>
{
    private readonly ILogger<WarehouseZoneCreatedEventHandler> _logger;

    public WarehouseZoneCreatedEventHandler(ILogger<WarehouseZoneCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseZoneCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse zone created: {Code} - {Name} in Warehouse {WarehouseId}",
            notification.Code,
            notification.Name,
            notification.WarehouseId);

        return Task.CompletedTask;
    }
}

public class WarehouseZoneActivatedEventHandler : INotificationHandler<WarehouseZoneActivatedDomainEvent>
{
    private readonly ILogger<WarehouseZoneActivatedEventHandler> _logger;

    public WarehouseZoneActivatedEventHandler(ILogger<WarehouseZoneActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseZoneActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse zone activated: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class WarehouseZoneDeactivatedEventHandler : INotificationHandler<WarehouseZoneDeactivatedDomainEvent>
{
    private readonly ILogger<WarehouseZoneDeactivatedEventHandler> _logger;

    public WarehouseZoneDeactivatedEventHandler(ILogger<WarehouseZoneDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseZoneDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Warehouse zone deactivated: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class WarehouseZoneTemperatureLimitsSetEventHandler : INotificationHandler<WarehouseZoneTemperatureLimitsSetDomainEvent>
{
    private readonly ILogger<WarehouseZoneTemperatureLimitsSetEventHandler> _logger;

    public WarehouseZoneTemperatureLimitsSetEventHandler(ILogger<WarehouseZoneTemperatureLimitsSetEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseZoneTemperatureLimitsSetDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse zone temperature limits set: {Code}, Min: {MinTemperature}°C, Max: {MaxTemperature}°C",
            notification.Code,
            notification.MinTemperature,
            notification.MaxTemperature);

        return Task.CompletedTask;
    }
}

#endregion
