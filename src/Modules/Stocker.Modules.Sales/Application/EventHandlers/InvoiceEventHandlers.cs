using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Invoice Event Handlers

/// <summary>
/// Satış faturası oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesInvoiceCreatedEventHandler : INotificationHandler<SalesInvoiceCreatedDomainEvent>
{
    private readonly ILogger<SalesInvoiceCreatedEventHandler> _logger;

    public SalesInvoiceCreatedEventHandler(ILogger<SalesInvoiceCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesInvoiceCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası oluşturuldu: {InvoiceNumber}, Müşteri: {CustomerName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış faturası onaylandığında tetiklenen handler
/// </summary>
public class SalesInvoiceApprovedEventHandler : INotificationHandler<SalesInvoiceApprovedDomainEvent>
{
    private readonly ILogger<SalesInvoiceApprovedEventHandler> _logger;

    public SalesInvoiceApprovedEventHandler(ILogger<SalesInvoiceApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesInvoiceApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası onaylandı: {InvoiceNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış faturası GİB'e gönderildiğinde tetiklenen handler
/// </summary>
public class SalesInvoiceSentToGibEventHandler : INotificationHandler<SalesInvoiceSentToGibDomainEvent>
{
    private readonly ILogger<SalesInvoiceSentToGibEventHandler> _logger;

    public SalesInvoiceSentToGibEventHandler(ILogger<SalesInvoiceSentToGibEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesInvoiceSentToGibDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası GİB'e gönderildi: {InvoiceNumber}, UUID: {GibUuid}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.GibUuid,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış faturası ödendiğinde tetiklenen handler
/// </summary>
public class SalesInvoicePaidEventHandler : INotificationHandler<SalesInvoicePaidDomainEvent>
{
    private readonly ILogger<SalesInvoicePaidEventHandler> _logger;

    public SalesInvoicePaidEventHandler(ILogger<SalesInvoicePaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesInvoicePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası ödendi: {InvoiceNumber}, Ödeme: {PaymentId}, Tutar: {PaidAmount}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.PaymentId,
            notification.PaidAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış faturası iptal edildiğinde tetiklenen handler
/// </summary>
public class SalesInvoiceCancelledEventHandler : INotificationHandler<SalesInvoiceCancelledDomainEvent>
{
    private readonly ILogger<SalesInvoiceCancelledEventHandler> _logger;

    public SalesInvoiceCancelledEventHandler(ILogger<SalesInvoiceCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesInvoiceCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış faturası iptal edildi: {InvoiceNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış faturası vadesi geçtiğinde tetiklenen handler
/// </summary>
public class SalesInvoiceOverdueEventHandler : INotificationHandler<SalesInvoiceOverdueDomainEvent>
{
    private readonly ILogger<SalesInvoiceOverdueEventHandler> _logger;

    public SalesInvoiceOverdueEventHandler(ILogger<SalesInvoiceOverdueEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesInvoiceOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış faturası vadesi geçti: {InvoiceNumber}, Kalan: {OutstandingAmount}, Gecikme: {DaysOverdue} gün, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.OutstandingAmount,
            notification.DaysOverdue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
