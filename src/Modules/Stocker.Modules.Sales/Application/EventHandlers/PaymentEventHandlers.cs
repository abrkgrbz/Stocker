using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Contracts;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Payment Event Handlers

/// <summary>
/// Müşteri ödemesi alındığında tetiklenen handler
/// </summary>
public class CustomerPaymentReceivedEventHandler : INotificationHandler<CustomerPaymentReceivedDomainEvent>
{
    private readonly ILogger<CustomerPaymentReceivedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public CustomerPaymentReceivedEventHandler(
        ILogger<CustomerPaymentReceivedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(CustomerPaymentReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi alındı: {PaymentNumber}, Müşteri: {CustomerName}, Tutar: {Amount} {Currency}, Yöntem: {PaymentMethod}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.CustomerName,
            notification.Amount,
            notification.Currency,
            notification.PaymentMethod,
            notification.TenantId);

        await _notificationService.NotifyPaymentReceivedAsync(
            notification.TenantId,
            notification.PaymentId,
            notification.PaymentNumber,
            notification.CustomerName,
            notification.Amount,
            notification.Currency,
            notification.PaymentMethod,
            cancellationToken);
    }
}

/// <summary>
/// Müşteri ödemesi onaylandığında tetiklenen handler
/// </summary>
public class CustomerPaymentConfirmedEventHandler : INotificationHandler<CustomerPaymentConfirmedDomainEvent>
{
    private readonly ILogger<CustomerPaymentConfirmedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public CustomerPaymentConfirmedEventHandler(
        ILogger<CustomerPaymentConfirmedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(CustomerPaymentConfirmedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi onaylandı: {PaymentNumber}, Tutar: {Amount}, Onaylayan: {ConfirmedById}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.Amount,
            notification.ConfirmedById,
            notification.TenantId);

        await _notificationService.NotifyPaymentConfirmedAsync(
            notification.TenantId,
            notification.PaymentId,
            notification.PaymentNumber,
            notification.Amount,
            notification.ConfirmedById?.ToString() ?? "Sistem",
            cancellationToken);
    }
}

/// <summary>
/// Müşteri ödemesi faturaya eşleştirildiğinde tetiklenen handler
/// </summary>
public class CustomerPaymentAllocatedEventHandler : INotificationHandler<CustomerPaymentAllocatedDomainEvent>
{
    private readonly ILogger<CustomerPaymentAllocatedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public CustomerPaymentAllocatedEventHandler(
        ILogger<CustomerPaymentAllocatedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(CustomerPaymentAllocatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi eşleştirildi: {PaymentNumber} -> {InvoiceNumber}, Tutar: {AllocatedAmount}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.InvoiceNumber,
            notification.AllocatedAmount,
            notification.TenantId);

        await _notificationService.NotifyPaymentAllocatedAsync(
            notification.TenantId,
            notification.PaymentId,
            notification.PaymentNumber,
            notification.InvoiceId,
            notification.InvoiceNumber,
            notification.AllocatedAmount,
            cancellationToken);
    }
}

/// <summary>
/// Müşteri ödemesi iade edildiğinde tetiklenen handler
/// </summary>
public class CustomerPaymentRefundedEventHandler : INotificationHandler<CustomerPaymentRefundedDomainEvent>
{
    private readonly ILogger<CustomerPaymentRefundedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public CustomerPaymentRefundedEventHandler(
        ILogger<CustomerPaymentRefundedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(CustomerPaymentRefundedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi iade edildi: {PaymentNumber}, Tutar: {RefundAmount}, Sebep: {RefundReason}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.RefundAmount,
            notification.RefundReason,
            notification.TenantId);

        await _notificationService.NotifyPaymentRefundedAsync(
            notification.TenantId,
            notification.PaymentId,
            notification.PaymentNumber,
            notification.RefundAmount,
            notification.RefundReason,
            cancellationToken);
    }
}

/// <summary>
/// Müşteri ödemesi başarısız olduğunda tetiklenen handler
/// </summary>
public class CustomerPaymentFailedEventHandler : INotificationHandler<CustomerPaymentFailedDomainEvent>
{
    private readonly ILogger<CustomerPaymentFailedEventHandler> _logger;
    private readonly ISalesNotificationService _notificationService;

    public CustomerPaymentFailedEventHandler(
        ILogger<CustomerPaymentFailedEventHandler> logger,
        ISalesNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(CustomerPaymentFailedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Müşteri ödemesi başarısız: {PaymentNumber}, Tutar: {Amount}, Sebep: {FailureReason}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.Amount,
            notification.FailureReason,
            notification.TenantId);

        await _notificationService.NotifyPaymentFailedAsync(
            notification.TenantId,
            notification.PaymentId,
            notification.PaymentNumber,
            notification.CustomerId,
            notification.Amount,
            notification.FailureReason,
            cancellationToken);
    }
}

#endregion
