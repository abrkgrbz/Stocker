using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region Quotation Event Handlers

/// <summary>
/// Teklif talebi oluşturulduğunda tetiklenen handler
/// </summary>
public class QuotationRequestCreatedEventHandler : INotificationHandler<QuotationRequestCreatedDomainEvent>
{
    private readonly ILogger<QuotationRequestCreatedEventHandler> _logger;

    public QuotationRequestCreatedEventHandler(ILogger<QuotationRequestCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuotationRequestCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif talebi oluşturuldu: {QuotationNumber}, Tedarikçi: {SupplierName}, Son Tarih: {DueDate}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.SupplierName,
            notification.DueDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif alındığında tetiklenen handler
/// </summary>
public class QuotationReceivedEventHandler : INotificationHandler<QuotationReceivedDomainEvent>
{
    private readonly ILogger<QuotationReceivedEventHandler> _logger;

    public QuotationReceivedEventHandler(ILogger<QuotationReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuotationReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif alındı: {QuotationNumber}, Tedarikçi: {SupplierName}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.SupplierName,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif kabul edildiğinde tetiklenen handler
/// </summary>
public class QuotationAcceptedEventHandler : INotificationHandler<QuotationAcceptedDomainEvent>
{
    private readonly ILogger<QuotationAcceptedEventHandler> _logger;

    public QuotationAcceptedEventHandler(ILogger<QuotationAcceptedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuotationAcceptedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Teklif kabul edildi: {QuotationNumber}, Sipariş: {PurchaseOrderId}, Tutar: {AcceptedAmount}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.PurchaseOrderId,
            notification.AcceptedAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Teklif reddedildiğinde tetiklenen handler
/// </summary>
public class QuotationRejectedEventHandler : INotificationHandler<QuotationRejectedDomainEvent>
{
    private readonly ILogger<QuotationRejectedEventHandler> _logger;

    public QuotationRejectedEventHandler(ILogger<QuotationRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuotationRejectedDomainEvent notification, CancellationToken cancellationToken)
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
public class QuotationExpiredEventHandler : INotificationHandler<QuotationExpiredDomainEvent>
{
    private readonly ILogger<QuotationExpiredEventHandler> _logger;

    public QuotationExpiredEventHandler(ILogger<QuotationExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuotationExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Teklif süresi doldu: {QuotationNumber}, Tenant: {TenantId}",
            notification.QuotationNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
