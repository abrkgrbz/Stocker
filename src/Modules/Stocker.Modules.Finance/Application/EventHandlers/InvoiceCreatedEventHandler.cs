using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Domain.Services;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Fatura oluşturulduğunda çalışan event handler.
/// - Cari hesap hareketi oluşturur
/// - Cari hesap bakiyesini günceller
/// </summary>
public class InvoiceCreatedEventHandler : INotificationHandler<InvoiceCreatedDomainEvent>
{
    private readonly ILogger<InvoiceCreatedEventHandler> _logger;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly ICurrentAccountTransactionService _transactionService;

    public InvoiceCreatedEventHandler(
        ILogger<InvoiceCreatedEventHandler> logger,
        IInvoiceRepository invoiceRepository,
        ICurrentAccountTransactionService transactionService)
    {
        _logger = logger;
        _invoiceRepository = invoiceRepository;
        _transactionService = transactionService;
    }

    public async Task Handle(InvoiceCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Processing InvoiceCreatedDomainEvent: {InvoiceNumber} for Tenant {TenantId}, Amount: {Amount} {Currency}",
            notification.InvoiceNumber,
            notification.TenantId,
            notification.TotalAmount,
            notification.Currency);

        try
        {
            // Faturayı al
            var invoice = await _invoiceRepository.GetByIdAsync(notification.InvoiceId, cancellationToken);
            if (invoice == null)
            {
                _logger.LogWarning("Invoice not found: {InvoiceId}", notification.InvoiceId);
                return;
            }

            // Cari hesap hareketi oluştur
            var transaction = await _transactionService.CreateFromInvoiceAsync(invoice, cancellationToken);

            _logger.LogInformation(
                "Current account transaction created: {TransactionNumber} for Invoice {InvoiceNumber}",
                transaction.TransactionNumber,
                notification.InvoiceNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing InvoiceCreatedDomainEvent for Invoice {InvoiceId}: {Message}",
                notification.InvoiceId,
                ex.Message);
            throw;
        }
    }
}
