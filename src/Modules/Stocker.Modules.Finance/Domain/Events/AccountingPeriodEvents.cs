using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region AccountingPeriod Events

/// <summary>
/// Muhasebe dönemi açıldığında tetiklenen event
/// </summary>
public sealed record AccountingPeriodOpenedDomainEvent(
    int AccountingPeriodId,
    Guid TenantId,
    string PeriodName,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Muhasebe dönemi kapatıldığında tetiklenen event
/// </summary>
public sealed record AccountingPeriodClosedDomainEvent(
    int AccountingPeriodId,
    Guid TenantId,
    string PeriodName,
    DateTime ClosedAt,
    int ClosedById) : DomainEvent;

/// <summary>
/// Muhasebe dönemi kilitlendiğinde tetiklenen event
/// </summary>
public sealed record AccountingPeriodLockedDomainEvent(
    int AccountingPeriodId,
    Guid TenantId,
    string PeriodName,
    DateTime LockedAt,
    string LockedByName) : DomainEvent;

/// <summary>
/// Yıl sonu kapanışı yapıldığında tetiklenen event
/// </summary>
public sealed record YearEndClosingCompletedDomainEvent(
    Guid TenantId,
    int FiscalYear,
    decimal NetProfit,
    DateTime ClosedAt) : DomainEvent;

#endregion
