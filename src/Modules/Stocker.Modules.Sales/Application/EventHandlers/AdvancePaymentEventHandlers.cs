using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region AdvancePayment Event Handlers

/// <summary>
/// Avans ödemesi alındığında tetiklenen handler
/// </summary>
public class AdvancePaymentReceivedEventHandler : INotificationHandler<AdvancePaymentReceivedDomainEvent>
{
    private readonly ILogger<AdvancePaymentReceivedEventHandler> _logger;

    public AdvancePaymentReceivedEventHandler(ILogger<AdvancePaymentReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AdvancePaymentReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Avans ödemesi alındı: {PaymentNumber}, Müşteri: {CustomerName}, Tutar: {Amount} {Currency}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.CustomerName,
            notification.Amount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Avans ödemesi faturaya uygulandığında tetiklenen handler
/// </summary>
public class AdvancePaymentAppliedEventHandler : INotificationHandler<AdvancePaymentAppliedDomainEvent>
{
    private readonly ILogger<AdvancePaymentAppliedEventHandler> _logger;

    public AdvancePaymentAppliedEventHandler(ILogger<AdvancePaymentAppliedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AdvancePaymentAppliedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Avans faturaya uygulandı: {PaymentNumber} -> {InvoiceNumber}, Uygulanan: {AppliedAmount}, Kalan: {RemainingBalance}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.InvoiceNumber,
            notification.AppliedAmount,
            notification.RemainingBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Avans bakiyesi iade edildiğinde tetiklenen handler
/// </summary>
public class AdvancePaymentRefundedEventHandler : INotificationHandler<AdvancePaymentRefundedDomainEvent>
{
    private readonly ILogger<AdvancePaymentRefundedEventHandler> _logger;

    public AdvancePaymentRefundedEventHandler(ILogger<AdvancePaymentRefundedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AdvancePaymentRefundedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Avans iade edildi: {PaymentNumber}, Tutar: {RefundAmount}, Sebep: {RefundReason}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.RefundAmount,
            notification.RefundReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
