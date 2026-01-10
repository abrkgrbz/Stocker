using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PurchaseOrder Event Handlers

/// <summary>
/// Satın alma siparişi oluşturulduğunda tetiklenen handler
/// </summary>
public class PurchaseOrderCreatedEventHandler : INotificationHandler<PurchaseOrderCreatedDomainEvent>
{
    private readonly ILogger<PurchaseOrderCreatedEventHandler> _logger;

    public PurchaseOrderCreatedEventHandler(ILogger<PurchaseOrderCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma siparişi oluşturuldu: {OrderNumber}, Tedarikçi: {SupplierName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.SupplierName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma siparişi onaylandığında tetiklenen handler
/// </summary>
public class PurchaseOrderApprovedEventHandler : INotificationHandler<PurchaseOrderApprovedDomainEvent>
{
    private readonly ILogger<PurchaseOrderApprovedEventHandler> _logger;

    public PurchaseOrderApprovedEventHandler(ILogger<PurchaseOrderApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma siparişi onaylandı: {OrderNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma siparişi tedarikçiye gönderildiğinde tetiklenen handler
/// </summary>
public class PurchaseOrderSentToSupplierEventHandler : INotificationHandler<PurchaseOrderSentToSupplierDomainEvent>
{
    private readonly ILogger<PurchaseOrderSentToSupplierEventHandler> _logger;

    public PurchaseOrderSentToSupplierEventHandler(ILogger<PurchaseOrderSentToSupplierEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderSentToSupplierDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma siparişi tedarikçiye gönderildi: {OrderNumber}, Tedarikçi: {SupplierName}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.SupplierName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma siparişi teslim alındığında tetiklenen handler
/// </summary>
public class PurchaseOrderReceivedEventHandler : INotificationHandler<PurchaseOrderReceivedDomainEvent>
{
    private readonly ILogger<PurchaseOrderReceivedEventHandler> _logger;

    public PurchaseOrderReceivedEventHandler(ILogger<PurchaseOrderReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma siparişi teslim alındı: {OrderNumber}, Mal Kabul: {GoodsReceiptId}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.GoodsReceiptId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma siparişi kısmen teslim alındığında tetiklenen handler
/// </summary>
public class PurchaseOrderPartiallyReceivedEventHandler : INotificationHandler<PurchaseOrderPartiallyReceivedDomainEvent>
{
    private readonly ILogger<PurchaseOrderPartiallyReceivedEventHandler> _logger;

    public PurchaseOrderPartiallyReceivedEventHandler(ILogger<PurchaseOrderPartiallyReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderPartiallyReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma siparişi kısmen teslim alındı: {OrderNumber}, Teslim: {ReceivedItemCount}/{TotalItemCount} (%{ReceivedPercentage}), Tenant: {TenantId}",
            notification.OrderNumber,
            notification.ReceivedItemCount,
            notification.TotalItemCount,
            notification.ReceivedPercentage,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma siparişi iptal edildiğinde tetiklenen handler
/// </summary>
public class PurchaseOrderCancelledEventHandler : INotificationHandler<PurchaseOrderCancelledDomainEvent>
{
    private readonly ILogger<PurchaseOrderCancelledEventHandler> _logger;

    public PurchaseOrderCancelledEventHandler(ILogger<PurchaseOrderCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma siparişi iptal edildi: {OrderNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma siparişi kapatıldığında tetiklenen handler
/// </summary>
public class PurchaseOrderClosedEventHandler : INotificationHandler<PurchaseOrderClosedDomainEvent>
{
    private readonly ILogger<PurchaseOrderClosedEventHandler> _logger;

    public PurchaseOrderClosedEventHandler(ILogger<PurchaseOrderClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseOrderClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma siparişi kapatıldı: {OrderNumber}, Tenant: {TenantId}",
            notification.OrderNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
