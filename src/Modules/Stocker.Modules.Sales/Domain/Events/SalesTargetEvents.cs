using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region SalesTarget Events

/// <summary>
/// Satış hedefi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesTargetCreatedDomainEvent(
    int SalesTargetId,
    Guid TenantId,
    string TargetName,
    int SalesRepId,
    string SalesRepName,
    decimal TargetAmount,
    string Period,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Satış hedefi ilerleme güncellendiğinde tetiklenen event
/// </summary>
public sealed record SalesTargetProgressUpdatedDomainEvent(
    int SalesTargetId,
    Guid TenantId,
    string TargetName,
    decimal TargetAmount,
    decimal AchievedAmount,
    decimal ProgressPercentage) : DomainEvent;

/// <summary>
/// Satış hedefi ulaşıldığında tetiklenen event
/// </summary>
public sealed record SalesTargetAchievedDomainEvent(
    int SalesTargetId,
    Guid TenantId,
    string TargetName,
    int SalesRepId,
    string SalesRepName,
    decimal TargetAmount,
    decimal AchievedAmount,
    DateTime AchievedAt) : DomainEvent;

/// <summary>
/// Satış hedefi kaçırıldığında tetiklenen event
/// </summary>
public sealed record SalesTargetMissedDomainEvent(
    int SalesTargetId,
    Guid TenantId,
    string TargetName,
    int SalesRepId,
    decimal TargetAmount,
    decimal AchievedAmount,
    decimal ShortfallAmount,
    DateTime EndDate) : DomainEvent;

#endregion
