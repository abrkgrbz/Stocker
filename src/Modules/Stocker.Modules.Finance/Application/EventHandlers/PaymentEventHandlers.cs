using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Payment Event Handlers

/// <summary>
/// Ödeme onaylandığında tetiklenen handler
/// </summary>
public class PaymentApprovedEventHandler : INotificationHandler<PaymentApprovedDomainEvent>
{
    private readonly ILogger<PaymentApprovedEventHandler> _logger;

    public PaymentApprovedEventHandler(ILogger<PaymentApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PaymentApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ödeme onaylandı: {PaymentNumber}, Onaylayan: {ApprovedByUserId}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.ApprovedByUserId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Ödeme faturaya eşleştirildiğinde tetiklenen handler
/// </summary>
public class PaymentAllocatedToInvoiceEventHandler : INotificationHandler<PaymentAllocatedToInvoiceDomainEvent>
{
    private readonly ILogger<PaymentAllocatedToInvoiceEventHandler> _logger;

    public PaymentAllocatedToInvoiceEventHandler(ILogger<PaymentAllocatedToInvoiceEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PaymentAllocatedToInvoiceDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ödeme faturaya eşleştirildi: {PaymentNumber} -> {InvoiceNumber}, Tutar: {AllocatedAmount} {Currency}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.InvoiceNumber,
            notification.AllocatedAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Ödeme iade edildiğinde tetiklenen handler
/// </summary>
public class PaymentRefundedEventHandler : INotificationHandler<PaymentRefundedDomainEvent>
{
    private readonly ILogger<PaymentRefundedEventHandler> _logger;

    public PaymentRefundedEventHandler(ILogger<PaymentRefundedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PaymentRefundedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ödeme iade edildi: {PaymentNumber}, İade Eden: {RefundedBy}, Tutar: {RefundAmount} {Currency}, Sebep: {RefundReason}, Tenant: {TenantId}",
            notification.PaymentNumber,
            notification.RefundedBy,
            notification.RefundAmount,
            notification.Currency,
            notification.RefundReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
