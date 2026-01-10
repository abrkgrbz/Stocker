using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Domain.Services;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Fatura iptal edildiğinde çalışan event handler.
/// - Ters cari hesap hareketi oluşturur
/// - Cari hesap bakiyesini geri yükler
/// </summary>
public class InvoiceCancelledEventHandler : INotificationHandler<InvoiceCancelledDomainEvent>
{
    private readonly ILogger<InvoiceCancelledEventHandler> _logger;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly ICurrentAccountTransactionService _transactionService;

    public InvoiceCancelledEventHandler(
        ILogger<InvoiceCancelledEventHandler> logger,
        IInvoiceRepository invoiceRepository,
        ICurrentAccountTransactionService transactionService)
    {
        _logger = logger;
        _invoiceRepository = invoiceRepository;
        _transactionService = transactionService;
    }

    public async Task Handle(InvoiceCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Processing InvoiceCancelledDomainEvent: {InvoiceNumber} for Tenant {TenantId}, Reason: {Reason}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.CancellationReason);

        try
        {
            // Faturayı al
            var invoice = await _invoiceRepository.GetByIdAsync(notification.InvoiceId, cancellationToken);
            if (invoice == null)
            {
                _logger.LogWarning("Invoice not found for reversal: {InvoiceId}", notification.InvoiceId);
                return;
            }

            // Ters cari hesap hareketi oluştur
            var reversalTransaction = await _transactionService.CreateReversalForInvoiceAsync(
                invoice,
                notification.CancellationReason,
                cancellationToken);

            _logger.LogInformation(
                "Reversal transaction created: {TransactionNumber} for cancelled Invoice {InvoiceNumber}",
                reversalTransaction.TransactionNumber,
                notification.InvoiceNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing InvoiceCancelledDomainEvent for Invoice {InvoiceId}: {Message}",
                notification.InvoiceId,
                ex.Message);
            throw;
        }
    }
}
