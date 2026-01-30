using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Contracts;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Quotation Event Handlers

/// <summary>
/// Teklif oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesQuotationCreatedEventHandler : INotificationHandler<SalesQuotationCreatedDomainEvent>
{
    private readonly ILogger<SalesQuotationCreatedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesQuotationCreatedEventHandler(
        ILogger<SalesQuotationCreatedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesQuotationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif oluşturuldu: {QuotationNumber}, Müşteri: {CustomerName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        await _notificationService.NotifyQuotationCreatedAsync(
            notification.TenantId,
            notification.SalesQuotationId,
            notification.QuotationNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            cancellationToken);
    }
}

/// <summary>
/// Teklif gönderildiğinde tetiklenen handler
/// </summary>
public class SalesQuotationSentEventHandler : INotificationHandler<SalesQuotationSentDomainEvent>
{
    private readonly ILogger<SalesQuotationSentEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesQuotationSentEventHandler(
        ILogger<SalesQuotationSentEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesQuotationSentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif gönderildi: {QuotationNumber}, E-posta: {CustomerEmail}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.CustomerEmail,
            notification.TenantId);

        await _notificationService.NotifyQuotationSentAsync(
            notification.TenantId,
            notification.SalesQuotationId,
            notification.QuotationNumber,
            notification.CustomerEmail,
            cancellationToken);
    }
}

/// <summary>
/// Teklif kabul edildiğinde tetiklenen handler
/// </summary>
public class SalesQuotationAcceptedEventHandler : INotificationHandler<SalesQuotationAcceptedDomainEvent>
{
    private readonly ILogger<SalesQuotationAcceptedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesQuotationAcceptedEventHandler(
        ILogger<SalesQuotationAcceptedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesQuotationAcceptedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif kabul edildi: {QuotationNumber}, Sipariş: {SalesOrderId}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.SalesOrderId,
            notification.TenantId);

        await _notificationService.NotifyQuotationAcceptedAsync(
            notification.TenantId,
            notification.SalesQuotationId,
            notification.QuotationNumber,
            notification.SalesOrderId,
            cancellationToken);
    }
}

/// <summary>
/// Teklif reddedildiğinde tetiklenen handler
/// </summary>
public class SalesQuotationRejectedEventHandler : INotificationHandler<SalesQuotationRejectedDomainEvent>
{
    private readonly ILogger<SalesQuotationRejectedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesQuotationRejectedEventHandler(
        ILogger<SalesQuotationRejectedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesQuotationRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif reddedildi: {QuotationNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.RejectionReason,
            notification.TenantId);

        await _notificationService.NotifyQuotationRejectedAsync(
            notification.TenantId,
            notification.SalesQuotationId,
            notification.QuotationNumber,
            notification.RejectionReason,
            cancellationToken);
    }
}

/// <summary>
/// Teklif süresi dolduğunda tetiklenen handler
/// </summary>
public class SalesQuotationExpiredEventHandler : INotificationHandler<SalesQuotationExpiredDomainEvent>
{
    private readonly ILogger<SalesQuotationExpiredEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public SalesQuotationExpiredEventHandler(
        ILogger<SalesQuotationExpiredEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(SalesQuotationExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Teklif süresi doldu: {QuotationNumber}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.TenantId);

        await _notificationService.NotifyQuotationExpiredAsync(
            notification.TenantId,
            notification.SalesQuotationId,
            notification.QuotationNumber,
            cancellationToken);
    }
}

#endregion
