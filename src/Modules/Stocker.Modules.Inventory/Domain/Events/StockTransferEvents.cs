using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Stok transferi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record StockTransferCreatedDomainEvent(
    int StockTransferId,
    Guid TenantId,
    string TransferNumber,
    DateTime TransferDate,
    int SourceWarehouseId,
    int DestinationWarehouseId,
    TransferType TransferType,
    int ItemCount,
    int CreatedByUserId) : DomainEvent;

/// <summary>
/// Stok transferi onaylandığında tetiklenen event.
/// </summary>
public sealed record StockTransferApprovedDomainEvent(
    int StockTransferId,
    Guid TenantId,
    string TransferNumber,
    int ApprovedByUserId,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Stok transferi sevk edildiğinde tetiklenen event.
/// </summary>
public sealed record StockTransferShippedDomainEvent(
    int StockTransferId,
    Guid TenantId,
    string TransferNumber,
    int SourceWarehouseId,
    int DestinationWarehouseId,
    int ShippedByUserId,
    DateTime ShippedAt,
    decimal TotalShippedQuantity) : DomainEvent;

/// <summary>
/// Stok transferi teslim alındığında tetiklenen event.
/// </summary>
public sealed record StockTransferReceivedDomainEvent(
    int StockTransferId,
    Guid TenantId,
    string TransferNumber,
    int SourceWarehouseId,
    int DestinationWarehouseId,
    int ReceivedByUserId,
    DateTime ReceivedAt,
    decimal TotalReceivedQuantity,
    decimal TotalDamagedQuantity) : DomainEvent;

/// <summary>
/// Stok transferi tamamlandığında tetiklenen event.
/// </summary>
public sealed record StockTransferCompletedDomainEvent(
    int StockTransferId,
    Guid TenantId,
    string TransferNumber,
    int SourceWarehouseId,
    int DestinationWarehouseId,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Stok transferi iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record StockTransferCancelledDomainEvent(
    int StockTransferId,
    Guid TenantId,
    string TransferNumber,
    string CancelledBy,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;
