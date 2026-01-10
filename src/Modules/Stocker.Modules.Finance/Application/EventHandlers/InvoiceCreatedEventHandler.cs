using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Fatura oluşturulduğunda çalışan event handler.
/// - Cari hesap bakiyesini günceller
/// - Muhasebe kaydı oluşturur
/// - Bildirim gönderir
/// </summary>
public class InvoiceCreatedEventHandler : INotificationHandler<InvoiceCreatedDomainEvent>
{
    private readonly ILogger<InvoiceCreatedEventHandler> _logger;

    public InvoiceCreatedEventHandler(ILogger<InvoiceCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public async Task Handle(InvoiceCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Invoice created: {InvoiceNumber} for Tenant {TenantId}, Amount: {Amount} {Currency}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.TotalAmount,
            notification.Currency);

        // TODO: Cari hesap bakiyesini güncelle
        // await _currentAccountService.UpdateBalanceAsync(notification.CurrentAccountId, notification.TotalAmount, cancellationToken);

        // TODO: Muhasebe kaydı oluştur (Journal Entry)
        // await _journalEntryService.CreateForInvoiceAsync(notification.InvoiceId, cancellationToken);

        // TODO: Bildirim gönder
        // await _notificationService.SendInvoiceCreatedNotificationAsync(notification, cancellationToken);

        await Task.CompletedTask;
    }
}
