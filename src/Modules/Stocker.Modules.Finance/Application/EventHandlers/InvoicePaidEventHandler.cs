using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Fatura ödendiğinde çalışan event handler.
/// - Cari hesap bakiyesini günceller
/// - Ödeme makbuzu oluşturur
/// - E-posta/bildirim gönderir
/// </summary>
public class InvoicePaidEventHandler : INotificationHandler<InvoicePaidDomainEvent>
{
    private readonly ILogger<InvoicePaidEventHandler> _logger;

    public InvoicePaidEventHandler(ILogger<InvoicePaidEventHandler> logger)
    {
        _logger = logger;
    }

    public async Task Handle(InvoicePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Invoice paid: {InvoiceNumber} for Tenant {TenantId}, Paid: {PaidAmount}, Remaining: {RemainingAmount}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.PaidAmount,
            notification.RemainingAmount);

        // TODO: Cari hesap bakiyesini düşür
        // await _currentAccountService.DeductBalanceAsync(notification.CurrentAccountId, notification.PaidAmount, cancellationToken);

        // TODO: Muhasebe kaydı oluştur
        // await _journalEntryService.CreateForPaymentAsync(notification.PaymentId, notification.InvoiceId, cancellationToken);

        // TODO: Ödeme makbuzu oluştur
        // await _receiptService.CreatePaymentReceiptAsync(notification, cancellationToken);

        // TODO: Müşteriye ödeme onayı e-postası gönder
        // await _emailService.SendPaymentConfirmationAsync(notification, cancellationToken);

        await Task.CompletedTask;
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

    public async Task Handle(InvoicePartiallyPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Invoice partially paid: {InvoiceNumber} for Tenant {TenantId}, " +
            "This payment: {PaidAmount}, Total paid: {TotalPaidAmount}, Remaining: {RemainingAmount}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.PaidAmount,
            notification.TotalPaidAmount,
            notification.RemainingAmount);

        // Kısmi ödeme işlemleri...
        await Task.CompletedTask;
    }
}
