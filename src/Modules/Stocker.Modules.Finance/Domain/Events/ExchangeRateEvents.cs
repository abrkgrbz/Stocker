using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region ExchangeRate Events

/// <summary>
/// Döviz kuru güncellendiğinde tetiklenen event
/// </summary>
public sealed record ExchangeRateUpdatedDomainEvent(
    int ExchangeRateId,
    Guid TenantId,
    string FromCurrency,
    string ToCurrency,
    decimal OldRate,
    decimal NewRate,
    DateTime EffectiveDate) : DomainEvent;

/// <summary>
/// Kur farkı hesaplandığında tetiklenen event
/// </summary>
public sealed record ExchangeRateDifferenceCalculatedDomainEvent(
    Guid TenantId,
    string Currency,
    decimal GainOrLoss,
    DateTime CalculationDate,
    int AffectedTransactionCount) : DomainEvent;

#endregion
