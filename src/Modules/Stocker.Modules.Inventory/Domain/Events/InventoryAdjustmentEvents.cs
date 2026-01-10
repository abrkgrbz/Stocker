using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Stok düzeltmesi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record InventoryAdjustmentCreatedDomainEvent(
    int InventoryAdjustmentId,
    Guid TenantId,
    string AdjustmentNumber,
    DateTime AdjustmentDate,
    int WarehouseId,
    int? LocationId,
    string AdjustmentType,
    string Reason,
    int ItemCount,
    decimal TotalCostImpact) : DomainEvent;

/// <summary>
/// Stok düzeltmesi onaylandığında tetiklenen event.
/// </summary>
public sealed record InventoryAdjustmentApprovedDomainEvent(
    int InventoryAdjustmentId,
    Guid TenantId,
    string AdjustmentNumber,
    string ApprovedBy,
    DateTime ApprovedAt,
    decimal TotalCostImpact) : DomainEvent;

/// <summary>
/// Stok düzeltmesi işlendiğinde tetiklenen event.
/// </summary>
public sealed record InventoryAdjustmentProcessedDomainEvent(
    int InventoryAdjustmentId,
    Guid TenantId,
    string AdjustmentNumber,
    int WarehouseId,
    int ItemCount,
    decimal TotalPositiveAdjustment,
    decimal TotalNegativeAdjustment,
    decimal TotalCostImpact,
    DateTime ProcessedAt) : DomainEvent;

/// <summary>
/// Stok düzeltmesi reddedildiğinde tetiklenen event.
/// </summary>
public sealed record InventoryAdjustmentRejectedDomainEvent(
    int InventoryAdjustmentId,
    Guid TenantId,
    string AdjustmentNumber,
    string RejectedBy,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Stok düzeltmesi iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record InventoryAdjustmentCancelledDomainEvent(
    int InventoryAdjustmentId,
    Guid TenantId,
    string AdjustmentNumber,
    string CancelledBy,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;
