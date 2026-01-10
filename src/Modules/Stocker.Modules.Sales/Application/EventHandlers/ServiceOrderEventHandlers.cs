using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region ServiceOrder Event Handlers

/// <summary>
/// Servis siparişi oluşturulduğunda tetiklenen handler
/// </summary>
public class ServiceOrderCreatedEventHandler : INotificationHandler<ServiceOrderCreatedDomainEvent>
{
    private readonly ILogger<ServiceOrderCreatedEventHandler> _logger;

    public ServiceOrderCreatedEventHandler(ILogger<ServiceOrderCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ServiceOrderCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Servis siparişi oluşturuldu: {OrderNumber}, Müşteri: {CustomerName}, Tip: {ServiceType}, Öncelik: {Priority}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CustomerName,
            notification.ServiceType,
            notification.Priority,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Servis siparişi atandığında tetiklenen handler
/// </summary>
public class ServiceOrderAssignedEventHandler : INotificationHandler<ServiceOrderAssignedDomainEvent>
{
    private readonly ILogger<ServiceOrderAssignedEventHandler> _logger;

    public ServiceOrderAssignedEventHandler(ILogger<ServiceOrderAssignedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ServiceOrderAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Servis siparişi atandı: {OrderNumber}, Teknisyen: {TechnicianName}, Planlanan: {ScheduledDate}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.TechnicianName,
            notification.ScheduledDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Servis siparişi başlatıldığında tetiklenen handler
/// </summary>
public class ServiceOrderStartedEventHandler : INotificationHandler<ServiceOrderStartedDomainEvent>
{
    private readonly ILogger<ServiceOrderStartedEventHandler> _logger;

    public ServiceOrderStartedEventHandler(ILogger<ServiceOrderStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ServiceOrderStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Servis siparişi başlatıldı: {OrderNumber}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Servis siparişi tamamlandığında tetiklenen handler
/// </summary>
public class ServiceOrderCompletedEventHandler : INotificationHandler<ServiceOrderCompletedDomainEvent>
{
    private readonly ILogger<ServiceOrderCompletedEventHandler> _logger;

    public ServiceOrderCompletedEventHandler(ILogger<ServiceOrderCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ServiceOrderCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Servis siparişi tamamlandı: {OrderNumber}, Çözüm: {Resolution}, Maliyet: {ServiceCost}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.Resolution,
            notification.ServiceCost,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Servis siparişi iptal edildiğinde tetiklenen handler
/// </summary>
public class ServiceOrderCancelledEventHandler : INotificationHandler<ServiceOrderCancelledDomainEvent>
{
    private readonly ILogger<ServiceOrderCancelledEventHandler> _logger;

    public ServiceOrderCancelledEventHandler(ILogger<ServiceOrderCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ServiceOrderCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Servis siparişi iptal edildi: {OrderNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
