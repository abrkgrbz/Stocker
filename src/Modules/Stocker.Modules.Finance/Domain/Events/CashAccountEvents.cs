using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region CashAccount Events

/// <summary>
/// Kasa hesabı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record CashAccountCreatedDomainEvent(
    int CashAccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName,
    string Currency,
    decimal OpeningBalance) : DomainEvent;

/// <summary>
/// Kasaya para girişi yapıldığında tetiklenen event
/// </summary>
public sealed record CashReceivedDomainEvent(
    int CashAccountId,
    Guid TenantId,
    string AccountCode,
    decimal Amount,
    string Currency,
    decimal NewBalance,
    string Description) : DomainEvent;

/// <summary>
/// Kasadan para çıkışı yapıldığında tetiklenen event
/// </summary>
public sealed record CashPaidDomainEvent(
    int CashAccountId,
    Guid TenantId,
    string AccountCode,
    decimal Amount,
    string Currency,
    decimal NewBalance,
    string Description) : DomainEvent;

/// <summary>
/// Kasa sayımı yapıldığında tetiklenen event
/// </summary>
public sealed record CashCountedDomainEvent(
    int CashAccountId,
    Guid TenantId,
    string AccountCode,
    decimal SystemBalance,
    decimal ActualBalance,
    decimal Difference,
    DateTime CountedAt) : DomainEvent;

#endregion
