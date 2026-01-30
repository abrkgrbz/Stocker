using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Contracts;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Invoice Event Handlers

/// <summary>
/// Satış faturası oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesInvoiceCreatedEventHandler : INotificationHandler<SalesInvoiceCreatedDomainEvent>
{
    private readonly ILogger<SalesInvoiceCreatedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesInvoiceCreatedEventHandler(
        ILogger<SalesInvoiceCreatedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesInvoiceCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası oluşturuldu: {InvoiceNumber}, Müşteri: {CustomerName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        await _notificationService.NotifyInvoiceCreatedAsync(
            notification.TenantId,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            cancellationToken);
    }
}

/// <summary>
/// Satış faturası onaylandığında tetiklenen handler
/// </summary>
public class SalesInvoiceApprovedEventHandler : INotificationHandler<SalesInvoiceApprovedDomainEvent>
{
    private readonly ILogger<SalesInvoiceApprovedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesInvoiceApprovedEventHandler(
        ILogger<SalesInvoiceApprovedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesInvoiceApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası onaylandı: {InvoiceNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.ApprovedById,
            notification.TenantId);

        await _notificationService.NotifyInvoiceApprovedAsync(
            notification.TenantId,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.ApprovedById?.ToString() ?? "Sistem",
            cancellationToken);
    }
}

/// <summary>
/// Satış faturası GİB'e gönderildiğinde tetiklenen handler
/// </summary>
public class SalesInvoiceSentToGibEventHandler : INotificationHandler<SalesInvoiceSentToGibDomainEvent>
{
    private readonly ILogger<SalesInvoiceSentToGibEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesInvoiceSentToGibEventHandler(
        ILogger<SalesInvoiceSentToGibEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesInvoiceSentToGibDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası GİB'e gönderildi: {InvoiceNumber}, UUID: {GibUuid}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.GibUuid,
            notification.TenantId);

        await _notificationService.NotifyInvoiceSentToGibAsync(
            notification.TenantId,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.GibUuid,
            cancellationToken);
    }
}

/// <summary>
/// Satış faturası ödendiğinde tetiklenen handler
/// </summary>
public class SalesInvoicePaidEventHandler : INotificationHandler<SalesInvoicePaidDomainEvent>
{
    private readonly ILogger<SalesInvoicePaidEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesInvoicePaidEventHandler(
        ILogger<SalesInvoicePaidEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesInvoicePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış faturası ödendi: {InvoiceNumber}, Ödeme: {PaymentId}, Tutar: {PaidAmount}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.PaymentId,
            notification.PaidAmount,
            notification.TenantId);

        await _notificationService.NotifyInvoicePaidAsync(
            notification.TenantId,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.PaymentId,
            notification.PaidAmount,
            cancellationToken);
    }
}

/// <summary>
/// Satış faturası iptal edildiğinde tetiklenen handler
/// </summary>
public class SalesInvoiceCancelledEventHandler : INotificationHandler<SalesInvoiceCancelledDomainEvent>
{
    private readonly ILogger<SalesInvoiceCancelledEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesInvoiceCancelledEventHandler(
        ILogger<SalesInvoiceCancelledEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesInvoiceCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış faturası iptal edildi: {InvoiceNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.CancellationReason,
            notification.TenantId);

        await _notificationService.NotifyInvoiceCancelledAsync(
            notification.TenantId,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.CancellationReason,
            cancellationToken);
    }
}

/// <summary>
/// Satış faturası vadesi geçtiğinde tetiklenen handler
/// </summary>
public class SalesInvoiceOverdueEventHandler : INotificationHandler<SalesInvoiceOverdueDomainEvent>
{
    private readonly ILogger<SalesInvoiceOverdueEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesInvoiceOverdueEventHandler(
        ILogger<SalesInvoiceOverdueEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesInvoiceOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış faturası vadesi geçti: {InvoiceNumber}, Kalan: {OutstandingAmount}, Gecikme: {DaysOverdue} gün, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.OutstandingAmount,
            notification.DaysOverdue,
            notification.TenantId);

        await _notificationService.NotifyInvoiceOverdueAsync(
            notification.TenantId,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.CustomerId,
            notification.OutstandingAmount,
            notification.DaysOverdue,
            cancellationToken);
    }
}

#endregion
