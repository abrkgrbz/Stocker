using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Stok sayımı oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record StockCountCreatedDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    int WarehouseId,
    string CountType,
    int ItemCount) : DomainEvent;

/// <summary>
/// Stok sayımı başlatıldığında tetiklenen event.
/// </summary>
public sealed record StockCountStartedDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    int WarehouseId,
    int CountedByUserId,
    DateTime StartedAt) : DomainEvent;

/// <summary>
/// Stok sayımı tamamlandığında tetiklenen event.
/// </summary>
public sealed record StockCountCompletedDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    int WarehouseId,
    decimal TotalSystemQuantity,
    decimal TotalCountedQuantity,
    decimal TotalDifference,
    int ItemsWithDifferenceCount) : DomainEvent;

/// <summary>
/// Stok sayımı onaylandığında tetiklenen event.
/// </summary>
public sealed record StockCountApprovedDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    int ApprovedByUserId,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Stok sayımı reddedildiğinde tetiklenen event.
/// </summary>
public sealed record StockCountRejectedDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    string? Reason) : DomainEvent;

/// <summary>
/// Stok sayımı iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record StockCountCancelledDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    string? Reason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Stok sayımı düzeltme olarak işlendiğinde tetiklenen event.
/// </summary>
public sealed record StockCountAdjustedDomainEvent(
    int StockCountId,
    Guid TenantId,
    string CountNumber,
    int WarehouseId,
    decimal TotalDifference) : DomainEvent;
