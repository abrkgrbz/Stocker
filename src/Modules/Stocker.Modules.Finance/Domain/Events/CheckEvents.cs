using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region Check Events

/// <summary>
/// Çek oluşturulduğunda tetiklenen event
/// </summary>
public sealed record CheckCreatedDomainEvent(
    int CheckId,
    Guid TenantId,
    string CheckNumber,
    string CheckType,
    decimal Amount,
    string Currency,
    DateTime DueDate,
    string DrawerName) : DomainEvent;

/// <summary>
/// Çek tahsil edildiğinde tetiklenen event
/// </summary>
public sealed record CheckCollectedDomainEvent(
    int CheckId,
    Guid TenantId,
    string CheckNumber,
    decimal Amount,
    DateTime CollectedAt,
    int BankAccountId) : DomainEvent;

/// <summary>
/// Çek karşılıksız çıktığında tetiklenen event
/// </summary>
public sealed record CheckBouncedDomainEvent(
    int CheckId,
    Guid TenantId,
    string CheckNumber,
    string DrawerName,
    decimal Amount,
    string BounceReason,
    DateTime BouncedAt) : DomainEvent;

/// <summary>
/// Çek ciro edildiğinde tetiklenen event
/// </summary>
public sealed record CheckEndorsedDomainEvent(
    int CheckId,
    Guid TenantId,
    string CheckNumber,
    string EndorsedTo,
    DateTime EndorsedAt) : DomainEvent;

#endregion
