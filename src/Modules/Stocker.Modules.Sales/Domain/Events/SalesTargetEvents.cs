using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region SalesTarget Events

/// <summary>
/// Satış hedefi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesTargetCreatedDomainEvent(
    Guid SalesTargetId,
    Guid TenantId,
    string TargetName,
    Guid? SalesRepId,
    string SalesRepName,
    decimal TargetAmount,
    string Period,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Satış hedefi ilerleme güncellendiğinde tetiklenen event
/// </summary>
public sealed record SalesTargetProgressUpdatedDomainEvent(
    Guid SalesTargetId,
    Guid TenantId,
    string TargetName,
    decimal TargetAmount,
    decimal AchievedAmount,
    decimal ProgressPercentage) : DomainEvent;

/// <summary>
/// Satış hedefi ulaşıldığında tetiklenen event
/// </summary>
public sealed record SalesTargetAchievedDomainEvent(
    Guid SalesTargetId,
    Guid TenantId,
    string TargetName,
    Guid? SalesRepId,
    string SalesRepName,
    decimal TargetAmount,
    decimal AchievedAmount,
    DateTime AchievedAt) : DomainEvent;

/// <summary>
/// Satış hedefi kaçırıldığında tetiklenen event
/// </summary>
public sealed record SalesTargetMissedDomainEvent(
    Guid SalesTargetId,
    Guid TenantId,
    string TargetName,
    Guid? SalesRepId,
    decimal TargetAmount,
    decimal AchievedAmount,
    decimal ShortfallAmount,
    DateTime EndDate) : DomainEvent;

#endregion
