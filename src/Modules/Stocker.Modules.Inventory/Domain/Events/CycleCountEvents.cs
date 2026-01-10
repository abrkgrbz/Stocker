using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Dönemsel sayım planı oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record CycleCountCreatedDomainEvent(
    int CycleCountId,
    Guid TenantId,
    string PlanNumber,
    string PlanName,
    int WarehouseId,
    string CountType,
    DateTime ScheduledStartDate) : DomainEvent;

/// <summary>
/// Dönemsel sayım başlatıldığında tetiklenen event.
/// </summary>
public sealed record CycleCountStartedDomainEvent(
    int CycleCountId,
    Guid TenantId,
    string PlanNumber,
    int WarehouseId,
    int TotalItems,
    DateTime ActualStartDate) : DomainEvent;

/// <summary>
/// Dönemsel sayım tamamlandığında tetiklenen event.
/// </summary>
public sealed record CycleCountCompletedDomainEvent(
    int CycleCountId,
    Guid TenantId,
    string PlanNumber,
    int WarehouseId,
    int TotalItems,
    int CountedItems,
    int ItemsWithVariance,
    decimal? AccuracyPercent,
    DateTime ActualEndDate) : DomainEvent;

/// <summary>
/// Dönemsel sayım onaylandığında tetiklenen event.
/// </summary>
public sealed record CycleCountApprovedDomainEvent(
    int CycleCountId,
    Guid TenantId,
    string PlanNumber,
    string ApprovedBy,
    DateTime ApprovedDate) : DomainEvent;

/// <summary>
/// Dönemsel sayım iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record CycleCountCancelledDomainEvent(
    int CycleCountId,
    Guid TenantId,
    string PlanNumber,
    string Reason) : DomainEvent;

/// <summary>
/// Dönemsel sayım işlendiğinde (stok düzeltmeleri uygulandığında) tetiklenen event.
/// </summary>
public sealed record CycleCountProcessedDomainEvent(
    int CycleCountId,
    Guid TenantId,
    string PlanNumber,
    int WarehouseId,
    int ItemsWithVariance) : DomainEvent;
