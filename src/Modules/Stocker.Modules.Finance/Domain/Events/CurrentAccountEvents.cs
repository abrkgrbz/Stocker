using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region CurrentAccount Events

/// <summary>
/// Cari hesap oluşturulduğunda tetiklenen event
/// </summary>
public sealed record CurrentAccountCreatedDomainEvent(
    int CurrentAccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName,
    string AccountType,
    decimal CreditLimit) : DomainEvent;

/// <summary>
/// Cari hesap bakiyesi güncellendiğinde tetiklenen event
/// </summary>
public sealed record CurrentAccountBalanceUpdatedDomainEvent(
    int CurrentAccountId,
    Guid TenantId,
    string AccountCode,
    decimal OldBalance,
    decimal NewBalance,
    string TransactionType) : DomainEvent;

/// <summary>
/// Cari hesap kredi limiti aşıldığında tetiklenen event
/// </summary>
public sealed record CurrentAccountCreditLimitExceededDomainEvent(
    int CurrentAccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName,
    decimal CreditLimit,
    decimal CurrentBalance) : DomainEvent;

/// <summary>
/// Cari hesap bloke edildiğinde tetiklenen event
/// </summary>
public sealed record CurrentAccountBlockedDomainEvent(
    int CurrentAccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName,
    string BlockReason,
    DateTime BlockedAt) : DomainEvent;

#endregion
