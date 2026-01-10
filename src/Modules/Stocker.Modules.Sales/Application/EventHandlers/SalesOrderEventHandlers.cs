using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region SalesOrder Event Handlers

/// <summary>
/// Satış siparişi oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesOrderCreatedEventHandler : INotificationHandler<SalesOrderCreatedDomainEvent>
{
    private readonly ILogger<SalesOrderCreatedEventHandler> _logger;

    public SalesOrderCreatedEventHandler(ILogger<SalesOrderCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesOrderCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi oluşturuldu: {OrderNumber}, Müşteri: {CustomerName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış siparişi onaylandığında tetiklenen handler
/// </summary>
public class SalesOrderConfirmedEventHandler : INotificationHandler<SalesOrderConfirmedDomainEvent>
{
    private readonly ILogger<SalesOrderConfirmedEventHandler> _logger;

    public SalesOrderConfirmedEventHandler(ILogger<SalesOrderConfirmedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesOrderConfirmedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi onaylandı: {OrderNumber}, Onaylayan: {ConfirmedById}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ConfirmedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış siparişi sevk edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderShippedEventHandler : INotificationHandler<SalesOrderShippedDomainEvent>
{
    private readonly ILogger<SalesOrderShippedEventHandler> _logger;

    public SalesOrderShippedEventHandler(ILogger<SalesOrderShippedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesOrderShippedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi sevk edildi: {OrderNumber}, Takip No: {TrackingNumber}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.TrackingNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış siparişi teslim edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderDeliveredEventHandler : INotificationHandler<SalesOrderDeliveredDomainEvent>
{
    private readonly ILogger<SalesOrderDeliveredEventHandler> _logger;

    public SalesOrderDeliveredEventHandler(ILogger<SalesOrderDeliveredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesOrderDeliveredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi teslim edildi: {OrderNumber}, Teslim Alan: {ReceivedBy}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ReceivedBy,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış siparişi iptal edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderCancelledEventHandler : INotificationHandler<SalesOrderCancelledDomainEvent>
{
    private readonly ILogger<SalesOrderCancelledEventHandler> _logger;

    public SalesOrderCancelledEventHandler(ILogger<SalesOrderCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesOrderCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış siparişi iptal edildi: {OrderNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış siparişi kısmen sevk edildiğinde tetiklenen handler
/// </summary>
public class SalesOrderPartiallyShippedEventHandler : INotificationHandler<SalesOrderPartiallyShippedDomainEvent>
{
    private readonly ILogger<SalesOrderPartiallyShippedEventHandler> _logger;

    public SalesOrderPartiallyShippedEventHandler(ILogger<SalesOrderPartiallyShippedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesOrderPartiallyShippedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış siparişi kısmen sevk edildi: {OrderNumber}, Sevk: {ShippedItemCount}/{TotalItemCount} (%{ShippedPercentage}), Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ShippedItemCount,
            notification.TotalItemCount,
            notification.ShippedPercentage,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
