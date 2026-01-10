using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region Unit Event Handlers

public class UnitCreatedEventHandler : INotificationHandler<UnitCreatedDomainEvent>
{
    private readonly ILogger<UnitCreatedEventHandler> _logger;

    public UnitCreatedEventHandler(ILogger<UnitCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(UnitCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Unit created: {Code} - {Name}, Base Unit: {IsBaseUnit}",
            notification.Code,
            notification.Name,
            notification.IsBaseUnit);

        return Task.CompletedTask;
    }
}

public class UnitUpdatedEventHandler : INotificationHandler<UnitUpdatedDomainEvent>
{
    private readonly ILogger<UnitUpdatedEventHandler> _logger;

    public UnitUpdatedEventHandler(ILogger<UnitUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(UnitUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Unit updated: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class UnitConversionDefinedEventHandler : INotificationHandler<UnitConversionDefinedDomainEvent>
{
    private readonly ILogger<UnitConversionDefinedEventHandler> _logger;

    public UnitConversionDefinedEventHandler(ILogger<UnitConversionDefinedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(UnitConversionDefinedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Unit conversion defined: Unit {FromUnitId} → Unit {ToUnitId}, Factor: {ConversionFactor}",
            notification.FromUnitId,
            notification.ToUnitId,
            notification.ConversionFactor);

        return Task.CompletedTask;
    }
}

public class UnitDeletedEventHandler : INotificationHandler<UnitDeletedDomainEvent>
{
    private readonly ILogger<UnitDeletedEventHandler> _logger;

    public UnitDeletedEventHandler(ILogger<UnitDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(UnitDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Unit deleted: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

#endregion
