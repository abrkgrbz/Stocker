using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Shipment Event Handlers

/// <summary>
/// Sevkiyat oluşturulduğunda tetiklenen handler
/// </summary>
public class ShipmentCreatedEventHandler : INotificationHandler<ShipmentCreatedDomainEvent>
{
    private readonly ILogger<ShipmentCreatedEventHandler> _logger;

    public ShipmentCreatedEventHandler(ILogger<ShipmentCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShipmentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat oluşturuldu: {ShipmentNumber}, Taşıyıcı: {CarrierName}, Planlanan: {PlannedShipDate}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.CarrierName,
            notification.PlannedShipDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Sevkiyat gönderildiğinde tetiklenen handler
/// </summary>
public class ShipmentDispatchedEventHandler : INotificationHandler<ShipmentDispatchedDomainEvent>
{
    private readonly ILogger<ShipmentDispatchedEventHandler> _logger;

    public ShipmentDispatchedEventHandler(ILogger<ShipmentDispatchedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShipmentDispatchedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat gönderildi: {ShipmentNumber}, Takip No: {TrackingNumber}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.TrackingNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Sevkiyat transit durumunda güncellendiğinde tetiklenen handler
/// </summary>
public class ShipmentInTransitUpdatedEventHandler : INotificationHandler<ShipmentInTransitUpdatedDomainEvent>
{
    private readonly ILogger<ShipmentInTransitUpdatedEventHandler> _logger;

    public ShipmentInTransitUpdatedEventHandler(ILogger<ShipmentInTransitUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShipmentInTransitUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat durumu güncellendi: {ShipmentNumber}, Konum: {CurrentLocation}, Durum: {Status}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.CurrentLocation,
            notification.Status,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Sevkiyat teslim edildiğinde tetiklenen handler
/// </summary>
public class ShipmentDeliveredEventHandler : INotificationHandler<ShipmentDeliveredDomainEvent>
{
    private readonly ILogger<ShipmentDeliveredEventHandler> _logger;

    public ShipmentDeliveredEventHandler(ILogger<ShipmentDeliveredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShipmentDeliveredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat teslim edildi: {ShipmentNumber}, Teslim Alan: {ReceivedBy}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.ReceivedBy,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Sevkiyat teslim edilemediğinde tetiklenen handler
/// </summary>
public class ShipmentDeliveryFailedEventHandler : INotificationHandler<ShipmentDeliveryFailedDomainEvent>
{
    private readonly ILogger<ShipmentDeliveryFailedEventHandler> _logger;

    public ShipmentDeliveryFailedEventHandler(ILogger<ShipmentDeliveryFailedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShipmentDeliveryFailedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Sevkiyat teslim edilemedi: {ShipmentNumber}, Sebep: {FailureReason}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.FailureReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
