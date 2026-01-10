using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region BankReconciliation Event Handlers

/// <summary>
/// Banka mutabakatı başlatıldığında tetiklenen handler
/// </summary>
public class BankReconciliationStartedEventHandler : INotificationHandler<BankReconciliationStartedDomainEvent>
{
    private readonly ILogger<BankReconciliationStartedEventHandler> _logger;

    public BankReconciliationStartedEventHandler(ILogger<BankReconciliationStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankReconciliationStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Banka mutabakatı başlatıldı: {BankAccountNumber}, Banka Bakiyesi: {BankBalance}, Defter Bakiyesi: {BookBalance}, Tarih: {ReconciliationDate}, Tenant: {TenantId}",
            notification.BankAccountNumber,
            notification.BankBalance,
            notification.BookBalance,
            notification.ReconciliationDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Banka mutabakatı tamamlandığında tetiklenen handler
/// </summary>
public class BankReconciliationCompletedEventHandler : INotificationHandler<BankReconciliationCompletedDomainEvent>
{
    private readonly ILogger<BankReconciliationCompletedEventHandler> _logger;

    public BankReconciliationCompletedEventHandler(ILogger<BankReconciliationCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankReconciliationCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Banka mutabakatı tamamlandı: {BankAccountNumber}, Mutabık İşlem: {ReconciledTransactionCount}, Mutabık Tutar: {ReconciledAmount}, Tenant: {TenantId}",
            notification.BankAccountNumber,
            notification.ReconciledTransactionCount,
            notification.ReconciledAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Mutabakat farkı tespit edildiğinde tetiklenen handler
/// </summary>
public class ReconciliationDiscrepancyFoundEventHandler : INotificationHandler<ReconciliationDiscrepancyFoundDomainEvent>
{
    private readonly ILogger<ReconciliationDiscrepancyFoundEventHandler> _logger;

    public ReconciliationDiscrepancyFoundEventHandler(ILogger<ReconciliationDiscrepancyFoundEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReconciliationDiscrepancyFoundDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Mutabakat farkı tespit edildi: {BankAccountNumber}, Fark: {Discrepancy}, Tip: {DiscrepancyType}, Tenant: {TenantId}",
            notification.BankAccountNumber,
            notification.Discrepancy,
            notification.DiscrepancyType,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
