using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region BankAccount Events

/// <summary>
/// Banka hesabı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record BankAccountCreatedDomainEvent(
    int BankAccountId,
    Guid TenantId,
    string AccountNumber,
    string BankName,
    string Currency,
    decimal OpeningBalance) : DomainEvent;

/// <summary>
/// Banka hesabı güncellendiğinde tetiklenen event
/// </summary>
public sealed record BankAccountUpdatedDomainEvent(
    int BankAccountId,
    Guid TenantId,
    string AccountNumber,
    string BankName) : DomainEvent;

/// <summary>
/// Banka hesabı kapatıldığında tetiklenen event
/// </summary>
public sealed record BankAccountClosedDomainEvent(
    int BankAccountId,
    Guid TenantId,
    string AccountNumber,
    string BankName,
    DateTime ClosedAt,
    string ClosureReason) : DomainEvent;

/// <summary>
/// Banka hesabına para yatırıldığında tetiklenen event
/// </summary>
public sealed record BankDepositMadeDomainEvent(
    int BankAccountId,
    Guid TenantId,
    string AccountNumber,
    decimal Amount,
    string Currency,
    decimal NewBalance,
    string Description) : DomainEvent;

/// <summary>
/// Banka hesabından para çekildiğinde tetiklenen event
/// </summary>
public sealed record BankWithdrawalMadeDomainEvent(
    int BankAccountId,
    Guid TenantId,
    string AccountNumber,
    decimal Amount,
    string Currency,
    decimal NewBalance,
    string Description) : DomainEvent;

#endregion
