using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region Account Events

/// <summary>
/// Hesap oluşturulduğunda tetiklenen event
/// </summary>
public sealed record AccountCreatedDomainEvent(
    int AccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName,
    string AccountType,
    int? ParentAccountId) : DomainEvent;

/// <summary>
/// Hesap güncellendiğinde tetiklenen event
/// </summary>
public sealed record AccountUpdatedDomainEvent(
    int AccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName) : DomainEvent;

/// <summary>
/// Hesap aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record AccountActivatedDomainEvent(
    int AccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName) : DomainEvent;

/// <summary>
/// Hesap pasifleştirildiğinde tetiklenen event
/// </summary>
public sealed record AccountDeactivatedDomainEvent(
    int AccountId,
    Guid TenantId,
    string AccountCode,
    string AccountName) : DomainEvent;

#endregion
