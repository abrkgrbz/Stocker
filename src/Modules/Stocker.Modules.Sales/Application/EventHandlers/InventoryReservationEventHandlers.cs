using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region InventoryReservation Event Handlers

/// <summary>
/// Stok rezervasyonu oluşturulduğunda tetiklenen handler
/// </summary>
public class InventoryReservationCreatedEventHandler : INotificationHandler<InventoryReservationCreatedDomainEvent>
{
    private readonly ILogger<InventoryReservationCreatedEventHandler> _logger;

    public InventoryReservationCreatedEventHandler(ILogger<InventoryReservationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryReservationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stok rezervasyonu oluşturuldu: {ReservationNumber}, Ürün: {ProductName}, Miktar: {ReservedQuantity}, Bitiş: {ExpiresAt}, Tenant: {TenantId}",
            notification.ReservationNumber,
            notification.ProductName,
            notification.ReservedQuantity,
            notification.ExpiresAt,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu onaylandığında tetiklenen handler
/// </summary>
public class InventoryReservationConfirmedEventHandler : INotificationHandler<InventoryReservationConfirmedDomainEvent>
{
    private readonly ILogger<InventoryReservationConfirmedEventHandler> _logger;

    public InventoryReservationConfirmedEventHandler(ILogger<InventoryReservationConfirmedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryReservationConfirmedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stok rezervasyonu onaylandı: {ReservationNumber}, Miktar: {ConfirmedQuantity}, Tenant: {TenantId}",
            notification.ReservationNumber,
            notification.ConfirmedQuantity,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu serbest bırakıldığında tetiklenen handler
/// </summary>
public class InventoryReservationReleasedEventHandler : INotificationHandler<InventoryReservationReleasedDomainEvent>
{
    private readonly ILogger<InventoryReservationReleasedEventHandler> _logger;

    public InventoryReservationReleasedEventHandler(ILogger<InventoryReservationReleasedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryReservationReleasedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stok rezervasyonu serbest bırakıldı: {ReservationNumber}, Miktar: {ReleasedQuantity}, Sebep: {ReleaseReason}, Tenant: {TenantId}",
            notification.ReservationNumber,
            notification.ReleasedQuantity,
            notification.ReleaseReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok rezervasyonu süresi dolduğunda tetiklenen handler
/// </summary>
public class InventoryReservationExpiredEventHandler : INotificationHandler<InventoryReservationExpiredDomainEvent>
{
    private readonly ILogger<InventoryReservationExpiredEventHandler> _logger;

    public InventoryReservationExpiredEventHandler(ILogger<InventoryReservationExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InventoryReservationExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stok rezervasyonu süresi doldu: {ReservationNumber}, Miktar: {ExpiredQuantity}, Tenant: {TenantId}",
            notification.ReservationNumber,
            notification.ExpiredQuantity,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
