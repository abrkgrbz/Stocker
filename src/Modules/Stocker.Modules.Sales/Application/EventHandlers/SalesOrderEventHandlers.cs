using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Contracts;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region SalesOrder Event Handlers

/// <summary>
/// Satış siparişi oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesOrderCreatedEventHandler : INotificationHandler<SalesOrderCreatedDomainEvent>
{
    private readonly ILogger<SalesOrderCreatedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesOrderCreatedEventHandler(
        ILogger<SalesOrderCreatedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesOrderCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi oluşturuldu: {OrderNumber}, Müşteri: {CustomerName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        await _notificationService.NotifySalesOrderCreatedAsync(
            notification.TenantId,
            notification.SalesOrderId,
            notification.OrderNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            cancellationToken);
    }
}

/// <summary>
/// Satış siparişi onaylandığında tetiklenen handler
/// </summary>
public class SalesOrderConfirmedEventHandler : INotificationHandler<SalesOrderConfirmedDomainEvent>
{
    private readonly ILogger<SalesOrderConfirmedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesOrderConfirmedEventHandler(
        ILogger<SalesOrderConfirmedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesOrderConfirmedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi onaylandı: {OrderNumber}, Onaylayan: {ConfirmedById}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ConfirmedById,
            notification.TenantId);

        await _notificationService.NotifySalesOrderConfirmedAsync(
            notification.TenantId,
            notification.SalesOrderId,
            notification.OrderNumber,
            notification.ConfirmedById?.ToString() ?? "Sistem",
            cancellationToken);
    }
}

/// <summary>
/// Satış siparişi sevk edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderShippedEventHandler : INotificationHandler<SalesOrderShippedDomainEvent>
{
    private readonly ILogger<SalesOrderShippedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesOrderShippedEventHandler(
        ILogger<SalesOrderShippedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesOrderShippedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi sevk edildi: {OrderNumber}, Takip No: {TrackingNumber}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.TrackingNumber,
            notification.TenantId);

        await _notificationService.NotifySalesOrderShippedAsync(
            notification.TenantId,
            notification.SalesOrderId,
            notification.OrderNumber,
            notification.TrackingNumber,
            string.Empty, // Carrier name not available in event
            cancellationToken);
    }
}

/// <summary>
/// Satış siparişi teslim edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderDeliveredEventHandler : INotificationHandler<SalesOrderDeliveredDomainEvent>
{
    private readonly ILogger<SalesOrderDeliveredEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesOrderDeliveredEventHandler(
        ILogger<SalesOrderDeliveredEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesOrderDeliveredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi teslim edildi: {OrderNumber}, Teslim Alan: {ReceivedBy}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ReceivedBy,
            notification.TenantId);

        await _notificationService.NotifySalesOrderDeliveredAsync(
            notification.TenantId,
            notification.SalesOrderId,
            notification.OrderNumber,
            notification.ReceivedBy,
            cancellationToken);
    }
}

/// <summary>
/// Satış siparişi iptal edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderCancelledEventHandler : INotificationHandler<SalesOrderCancelledDomainEvent>
{
    private readonly ILogger<SalesOrderCancelledEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesOrderCancelledEventHandler(
        ILogger<SalesOrderCancelledEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesOrderCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış siparişi iptal edildi: {OrderNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CancellationReason,
            notification.TenantId);

        await _notificationService.NotifySalesOrderCancelledAsync(
            notification.TenantId,
            notification.SalesOrderId,
            notification.OrderNumber,
            notification.CancellationReason,
            cancellationToken);
    }
}

/// <summary>
/// Satış siparişi kısmen sevk edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderPartiallyShippedEventHandler : INotificationHandler<SalesOrderPartiallyShippedDomainEvent>
{
    private readonly ILogger<SalesOrderPartiallyShippedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesOrderPartiallyShippedEventHandler(
        ILogger<SalesOrderPartiallyShippedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesOrderPartiallyShippedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi kısmen sevk edildi: {OrderNumber}, Sevk: {ShippedItemCount}/{TotalItemCount} (%{ShippedPercentage}), Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ShippedItemCount,
            notification.TotalItemCount,
            notification.ShippedPercentage,
            notification.TenantId);

        await _notificationService.NotifySalesOrderPartiallyShippedAsync(
            notification.TenantId,
            notification.SalesOrderId,
            notification.OrderNumber,
            notification.ShippedItemCount,
            notification.TotalItemCount,
            notification.ShippedPercentage,
            cancellationToken);
    }
}

#endregion
