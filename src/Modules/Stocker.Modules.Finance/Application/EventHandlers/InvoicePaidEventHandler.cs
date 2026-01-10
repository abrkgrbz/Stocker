using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Fatura ödendiğinde çalışan event handler.
/// - Bildirim gönderir
/// - Loglama yapar
/// Not: Cari hesap hareketi PaymentCreatedEventHandler tarafından oluşturulur.
/// </summary>
public class InvoicePaidEventHandler : INotificationHandler<InvoicePaidDomainEvent>
{
    private readonly ILogger<InvoicePaidEventHandler> _logger;

    public InvoicePaidEventHandler(ILogger<InvoicePaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoicePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Invoice fully paid: {InvoiceNumber} for Tenant {TenantId}, " +
            "Paid: {PaidAmount} {Currency}, Remaining: {RemainingAmount}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.PaidAmount,
            notification.Currency,
            notification.RemainingAmount);

        // Burada e-posta bildirimi gönderilebilir
        // await _emailService.SendPaymentConfirmationAsync(notification, cancellationToken);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fatura kısmen ödendiğinde çalışan event handler.
/// </summary>
public class InvoicePartiallyPaidEventHandler : INotificationHandler<InvoicePartiallyPaidDomainEvent>
{
    private readonly ILogger<InvoicePartiallyPaidEventHandler> _logger;

    public InvoicePartiallyPaidEventHandler(ILogger<InvoicePartiallyPaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoicePartiallyPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Invoice partially paid: {InvoiceNumber} for Tenant {TenantId}, " +
            "This payment: {PaidAmount}, Total paid: {TotalPaidAmount}, Remaining: {RemainingAmount} {Currency}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.PaidAmount,
            notification.TotalPaidAmount,
            notification.RemainingAmount,
            notification.Currency);

        return Task.CompletedTask;
    }
}
