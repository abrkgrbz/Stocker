using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Domain.Services;

namespace Stocker.Modules.Finance.Application.EventHandlers;

/// <summary>
/// Ödeme oluşturulduğunda çalışan event handler.
/// - Cari hesap hareketi oluşturur
/// - Cari hesap bakiyesini günceller
/// </summary>
public class PaymentCreatedEventHandler : INotificationHandler<PaymentCreatedDomainEvent>
{
    private readonly ILogger<PaymentCreatedEventHandler> _logger;
    private readonly IPaymentRepository _paymentRepository;
    private readonly ICurrentAccountTransactionService _transactionService;

    public PaymentCreatedEventHandler(
        ILogger<PaymentCreatedEventHandler> logger,
        IPaymentRepository paymentRepository,
        ICurrentAccountTransactionService transactionService)
    {
        _logger = logger;
        _paymentRepository = paymentRepository;
        _transactionService = transactionService;
    }

    public async Task Handle(PaymentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Processing PaymentCreatedDomainEvent: {PaymentNumber} for Tenant {TenantId}, Amount: {Amount} {Currency}, Direction: {Direction}",
            notification.PaymentNumber,
            notification.TenantId,
            notification.Amount,
            notification.Currency,
            notification.Direction);

        try
        {
            // Ödemeyi al
            var payment = await _paymentRepository.GetByIdAsync(notification.PaymentId, cancellationToken);
            if (payment == null)
            {
                _logger.LogWarning("Payment not found: {PaymentId}", notification.PaymentId);
                return;
            }

            // Cari hesap hareketi oluştur
            var transaction = await _transactionService.CreateFromPaymentAsync(payment, cancellationToken);

            _logger.LogInformation(
                "Current account transaction created: {TransactionNumber} for Payment {PaymentNumber}",
                transaction.TransactionNumber,
                notification.PaymentNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing PaymentCreatedDomainEvent for Payment {PaymentId}: {Message}",
                notification.PaymentId,
                ex.Message);
            throw;
        }
    }
}

/// <summary>
/// Ödeme iptal edildiğinde çalışan event handler.
/// - Ters cari hesap hareketi oluşturur
/// - Cari hesap bakiyesini geri yükler
/// </summary>
public class PaymentCancelledEventHandler : INotificationHandler<PaymentCancelledDomainEvent>
{
    private readonly ILogger<PaymentCancelledEventHandler> _logger;
    private readonly IPaymentRepository _paymentRepository;
    private readonly ICurrentAccountTransactionService _transactionService;

    public PaymentCancelledEventHandler(
        ILogger<PaymentCancelledEventHandler> logger,
        IPaymentRepository paymentRepository,
        ICurrentAccountTransactionService transactionService)
    {
        _logger = logger;
        _paymentRepository = paymentRepository;
        _transactionService = transactionService;
    }

    public async Task Handle(PaymentCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Processing PaymentCancelledDomainEvent: {PaymentNumber} for Tenant {TenantId}, Reason: {Reason}",
            notification.PaymentNumber,
            notification.TenantId,
            notification.CancellationReason);

        try
        {
            // Ödemeyi al
            var payment = await _paymentRepository.GetByIdAsync(notification.PaymentId, cancellationToken);
            if (payment == null)
            {
                _logger.LogWarning("Payment not found for reversal: {PaymentId}", notification.PaymentId);
                return;
            }

            // Ters cari hesap hareketi oluştur
            var reversalTransaction = await _transactionService.CreateReversalForPaymentAsync(
                payment,
                notification.CancellationReason,
                cancellationToken);

            _logger.LogInformation(
                "Reversal transaction created: {TransactionNumber} for cancelled Payment {PaymentNumber}",
                reversalTransaction.TransactionNumber,
                notification.PaymentNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing PaymentCancelledDomainEvent for Payment {PaymentId}: {Message}",
                notification.PaymentId,
                ex.Message);
            throw;
        }
    }
}
