using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Payment Event Handlers

/// <summary>
/// Müşteri ödemesi alındığında tetiklenen handler
/// </summary>
public class CustomerPaymentReceivedEventHandler : INotificationHandler<CustomerPaymentReceivedDomainEvent>
{
    private readonly ILogger<CustomerPaymentReceivedEventHandler> _logger;

    public CustomerPaymentReceivedEventHandler(ILogger<CustomerPaymentReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerPaymentReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi alındı: {PaymentNumber}, Müşteri: {CustomerName}, Tutar: {Amount} {Currency}, Yöntem: {PaymentMethod}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.CustomerName,
            notification.Amount,
            notification.Currency,
            notification.PaymentMethod,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri ödemesi onaylandığında tetiklenen handler
/// </summary>
public class CustomerPaymentConfirmedEventHandler : INotificationHandler<CustomerPaymentConfirmedDomainEvent>
{
    private readonly ILogger<CustomerPaymentConfirmedEventHandler> _logger;

    public CustomerPaymentConfirmedEventHandler(ILogger<CustomerPaymentConfirmedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerPaymentConfirmedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi onaylandı: {PaymentNumber}, Tutar: {Amount}, Onaylayan: {ConfirmedById}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.Amount,
            notification.ConfirmedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri ödemesi faturaya eşleştirildiğinde tetiklenen handler
/// </summary>
public class CustomerPaymentAllocatedEventHandler : INotificationHandler<CustomerPaymentAllocatedDomainEvent>
{
    private readonly ILogger<CustomerPaymentAllocatedEventHandler> _logger;

    public CustomerPaymentAllocatedEventHandler(ILogger<CustomerPaymentAllocatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerPaymentAllocatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi eşleştirildi: {PaymentNumber} -> {InvoiceNumber}, Tutar: {AllocatedAmount}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.InvoiceNumber,
            notification.AllocatedAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri ödemesi iade edildiğinde tetiklenen handler
/// </summary>
public class CustomerPaymentRefundedEventHandler : INotificationHandler<CustomerPaymentRefundedDomainEvent>
{
    private readonly ILogger<CustomerPaymentRefundedEventHandler> _logger;

    public CustomerPaymentRefundedEventHandler(ILogger<CustomerPaymentRefundedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerPaymentRefundedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri ödemesi iade edildi: {PaymentNumber}, Tutar: {RefundAmount}, Sebep: {RefundReason}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.RefundAmount,
            notification.RefundReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri ödemesi başarısız olduğunda tetiklenen handler
/// </summary>
public class CustomerPaymentFailedEventHandler : INotificationHandler<CustomerPaymentFailedDomainEvent>
{
    private readonly ILogger<CustomerPaymentFailedEventHandler> _logger;

    public CustomerPaymentFailedEventHandler(ILogger<CustomerPaymentFailedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerPaymentFailedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Müşteri ödemesi başarısız: {PaymentNumber}, Tutar: {Amount}, Sebep: {FailureReason}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.Amount,
            notification.FailureReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
