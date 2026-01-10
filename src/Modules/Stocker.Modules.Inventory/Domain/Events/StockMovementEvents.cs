using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Stok hareketi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record StockMovementCreatedDomainEvent(
    int StockMovementId,
    Guid TenantId,
    string DocumentNumber,
    DateTime MovementDate,
    int ProductId,
    int WarehouseId,
    StockMovementType MovementType,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost,
    string? LotNumber,
    string? SerialNumber,
    string? ReferenceDocumentType,
    string? ReferenceDocumentNumber) : DomainEvent;

/// <summary>
/// Stok hareketi tersine çevrildiğinde tetiklenen event.
/// </summary>
public sealed record StockMovementReversedDomainEvent(
    int StockMovementId,
    Guid TenantId,
    string DocumentNumber,
    int ReversedMovementId,
    int ProductId,
    int WarehouseId,
    StockMovementType MovementType,
    decimal Quantity,
    string ReversedBy,
    string? Reason) : DomainEvent;
