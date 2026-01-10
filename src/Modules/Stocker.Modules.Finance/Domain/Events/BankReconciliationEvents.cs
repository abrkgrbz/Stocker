using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region BankReconciliation Events

/// <summary>
/// Banka mutabakatı başlatıldığında tetiklenen event
/// </summary>
public sealed record BankReconciliationStartedDomainEvent(
    int BankReconciliationId,
    Guid TenantId,
    int BankAccountId,
    string BankAccountNumber,
    DateTime ReconciliationDate,
    decimal BankBalance,
    decimal BookBalance) : DomainEvent;

/// <summary>
/// Banka mutabakatı tamamlandığında tetiklenen event
/// </summary>
public sealed record BankReconciliationCompletedDomainEvent(
    int BankReconciliationId,
    Guid TenantId,
    int BankAccountId,
    string BankAccountNumber,
    int ReconciledTransactionCount,
    decimal ReconciledAmount,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Mutabakat farkı tespit edildiğinde tetiklenen event
/// </summary>
public sealed record ReconciliationDiscrepancyFoundDomainEvent(
    int BankReconciliationId,
    Guid TenantId,
    string BankAccountNumber,
    decimal Discrepancy,
    string DiscrepancyType) : DomainEvent;

#endregion
