using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Quotation Event Handlers

/// <summary>
/// Teklif oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesQuotationCreatedEventHandler : INotificationHandler<SalesQuotationCreatedDomainEvent>
{
    private readonly ILogger<SalesQuotationCreatedEventHandler> _logger;

    public SalesQuotationCreatedEventHandler(ILogger<SalesQuotationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesQuotationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif oluşturuldu: {QuotationNumber}, Müşteri: {CustomerName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.CustomerName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif gönderildiğinde tetiklenen handler
/// </summary>
public class SalesQuotationSentEventHandler : INotificationHandler<SalesQuotationSentDomainEvent>
{
    private readonly ILogger<SalesQuotationSentEventHandler> _logger;

    public SalesQuotationSentEventHandler(ILogger<SalesQuotationSentEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesQuotationSentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif gönderildi: {QuotationNumber}, E-posta: {CustomerEmail}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.CustomerEmail,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif kabul edildiğinde tetiklenen handler
/// </summary>
public class SalesQuotationAcceptedEventHandler : INotificationHandler<SalesQuotationAcceptedDomainEvent>
{
    private readonly ILogger<SalesQuotationAcceptedEventHandler> _logger;

    public SalesQuotationAcceptedEventHandler(ILogger<SalesQuotationAcceptedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesQuotationAcceptedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif kabul edildi: {QuotationNumber}, Sipariş: {SalesOrderId}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.SalesOrderId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif reddedildiğinde tetiklenen handler
/// </summary>
public class SalesQuotationRejectedEventHandler : INotificationHandler<SalesQuotationRejectedDomainEvent>
{
    private readonly ILogger<SalesQuotationRejectedEventHandler> _logger;

    public SalesQuotationRejectedEventHandler(ILogger<SalesQuotationRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesQuotationRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif reddedildi: {QuotationNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif süresi dolduğunda tetiklenen handler
/// </summary>
public class SalesQuotationExpiredEventHandler : INotificationHandler<SalesQuotationExpiredDomainEvent>
{
    private readonly ILogger<SalesQuotationExpiredEventHandler> _logger;

    public SalesQuotationExpiredEventHandler(ILogger<SalesQuotationExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesQuotationExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Teklif süresi doldu: {QuotationNumber}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
