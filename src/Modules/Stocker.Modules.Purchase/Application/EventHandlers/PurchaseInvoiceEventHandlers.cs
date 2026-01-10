using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PurchaseInvoice Event Handlers

/// <summary>
/// Satın alma faturası oluşturulduğunda tetiklenen handler
/// </summary>
public class PurchaseInvoiceCreatedEventHandler : INotificationHandler<PurchaseInvoiceCreatedDomainEvent>
{
    private readonly ILogger<PurchaseInvoiceCreatedEventHandler> _logger;

    public PurchaseInvoiceCreatedEventHandler(ILogger<PurchaseInvoiceCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseInvoiceCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma faturası oluşturuldu: {InvoiceNumber}, Tedarikçi: {SupplierName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.SupplierName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma faturası onaylandığında tetiklenen handler
/// </summary>
public class PurchaseInvoiceApprovedEventHandler : INotificationHandler<PurchaseInvoiceApprovedDomainEvent>
{
    private readonly ILogger<PurchaseInvoiceApprovedEventHandler> _logger;

    public PurchaseInvoiceApprovedEventHandler(ILogger<PurchaseInvoiceApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseInvoiceApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma faturası onaylandı: {InvoiceNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma faturası sipariş ile eşleştirildiğinde tetiklenen handler
/// </summary>
public class PurchaseInvoiceMatchedWithOrderEventHandler : INotificationHandler<PurchaseInvoiceMatchedWithOrderDomainEvent>
{
    private readonly ILogger<PurchaseInvoiceMatchedWithOrderEventHandler> _logger;

    public PurchaseInvoiceMatchedWithOrderEventHandler(ILogger<PurchaseInvoiceMatchedWithOrderEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseInvoiceMatchedWithOrderDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma faturası eşleştirildi: {InvoiceNumber} -> {OrderNumber}, Durum: {MatchStatus}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.OrderNumber,
            notification.MatchStatus,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma faturası ödendiğinde tetiklenen handler
/// </summary>
public class PurchaseInvoicePaidEventHandler : INotificationHandler<PurchaseInvoicePaidDomainEvent>
{
    private readonly ILogger<PurchaseInvoicePaidEventHandler> _logger;

    public PurchaseInvoicePaidEventHandler(ILogger<PurchaseInvoicePaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseInvoicePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma faturası ödendi: {InvoiceNumber}, Ödeme: {PaymentId}, Tutar: {PaidAmount}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.PaymentId,
            notification.PaidAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma faturası itiraz edildiğinde tetiklenen handler
/// </summary>
public class PurchaseInvoiceDisputedEventHandler : INotificationHandler<PurchaseInvoiceDisputedDomainEvent>
{
    private readonly ILogger<PurchaseInvoiceDisputedEventHandler> _logger;

    public PurchaseInvoiceDisputedEventHandler(ILogger<PurchaseInvoiceDisputedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseInvoiceDisputedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma faturası itiraz edildi: {InvoiceNumber}, Sebep: {DisputeReason}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.DisputeReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
