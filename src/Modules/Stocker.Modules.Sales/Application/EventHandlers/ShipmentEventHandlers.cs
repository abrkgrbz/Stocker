using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Contracts;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Shipment Event Handlers

/// <summary>
/// Sevkiyat oluşturulduğunda tetiklenen handler
/// </summary>
public class ShipmentCreatedEventHandler : INotificationHandler<ShipmentCreatedDomainEvent>
{
    private readonly ILogger<ShipmentCreatedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public ShipmentCreatedEventHandler(
        ILogger<ShipmentCreatedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(ShipmentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat oluşturuldu: {ShipmentNumber}, Taşıyıcı: {CarrierName}, Planlanan: {PlannedShipDate}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.CarrierName,
            notification.PlannedShipDate,
            notification.TenantId);

        await _notificationService.NotifyShipmentCreatedAsync(
            notification.TenantId,
            notification.ShipmentId,
            notification.ShipmentNumber,
            notification.SalesOrderId,
            notification.CarrierName,
            notification.PlannedShipDate,
            cancellationToken);
    }
}

/// <summary>
/// Sevkiyat gönderildiğinde tetiklenen handler
/// </summary>
public class ShipmentDispatchedEventHandler : INotificationHandler<ShipmentDispatchedDomainEvent>
{
    private readonly ILogger<ShipmentDispatchedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public ShipmentDispatchedEventHandler(
        ILogger<ShipmentDispatchedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(ShipmentDispatchedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat gönderildi: {ShipmentNumber}, Takip No: {TrackingNumber}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.TrackingNumber,
            notification.TenantId);

        await _notificationService.NotifyShipmentDispatchedAsync(
            notification.TenantId,
            notification.ShipmentId,
            notification.ShipmentNumber,
            notification.TrackingNumber,
            cancellationToken);
    }
}

/// <summary>
/// Sevkiyat transit durumunda güncellendiğinde tetiklenen handler
/// </summary>
public class ShipmentInTransitUpdatedEventHandler : INotificationHandler<ShipmentInTransitUpdatedDomainEvent>
{
    private readonly ILogger<ShipmentInTransitUpdatedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public ShipmentInTransitUpdatedEventHandler(
        ILogger<ShipmentInTransitUpdatedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(ShipmentInTransitUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat durumu güncellendi: {ShipmentNumber}, Konum: {CurrentLocation}, Durum: {Status}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.CurrentLocation,
            notification.Status,
            notification.TenantId);

        await _notificationService.NotifyShipmentStatusUpdatedAsync(
            notification.TenantId,
            notification.ShipmentId,
            notification.ShipmentNumber,
            notification.CurrentLocation,
            notification.Status,
            cancellationToken);
    }
}

/// <summary>
/// Sevkiyat teslim edildiğinde tetiklenen handler
/// </summary>
public class ShipmentDeliveredEventHandler : INotificationHandler<ShipmentDeliveredDomainEvent>
{
    private readonly ILogger<ShipmentDeliveredEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public ShipmentDeliveredEventHandler(
        ILogger<ShipmentDeliveredEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(ShipmentDeliveredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sevkiyat teslim edildi: {ShipmentNumber}, Teslim Alan: {ReceivedBy}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.ReceivedBy,
            notification.TenantId);

        await _notificationService.NotifyShipmentDeliveredAsync(
            notification.TenantId,
            notification.ShipmentId,
            notification.ShipmentNumber,
            notification.ReceivedBy,
            cancellationToken);
    }
}

/// <summary>
/// Sevkiyat teslim edilemediğinde tetiklenen handler
/// </summary>
public class ShipmentDeliveryFailedEventHandler : INotificationHandler<ShipmentDeliveryFailedDomainEvent>
{
    private readonly ILogger<ShipmentDeliveryFailedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public ShipmentDeliveryFailedEventHandler(
        ILogger<ShipmentDeliveryFailedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(ShipmentDeliveryFailedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Sevkiyat teslim edilemedi: {ShipmentNumber}, Sebep: {FailureReason}, Tenant: {TenantId}",
            notification.ShipmentNumber,
            notification.FailureReason,
            notification.TenantId);

        await _notificationService.NotifyShipmentDeliveryFailedAsync(
            notification.TenantId,
            notification.ShipmentId,
            notification.ShipmentNumber,
            notification.FailureReason,
            cancellationToken);
    }
}

#endregion
