using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Stok rezervasyonu oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record StockReservationCreatedDomainEvent(
    int StockReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    int WarehouseId,
    int? LocationId,
    decimal Quantity,
    ReservationType ReservationType,
    DateTime ReservationDate,
    DateTime? ExpirationDate,
    string? ReferenceDocumentType,
    string? ReferenceDocumentNumber) : DomainEvent;

/// <summary>
/// Stok rezervasyonu karşılandığında tetiklenen event.
/// </summary>
public sealed record StockReservationFulfilledDomainEvent(
    int StockReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    int WarehouseId,
    decimal FulfilledQuantity,
    DateTime FulfilledAt) : DomainEvent;

/// <summary>
/// Stok rezervasyonu kısmen karşılandığında tetiklenen event.
/// </summary>
public sealed record StockReservationPartiallyFulfilledDomainEvent(
    int StockReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    int WarehouseId,
    decimal FulfilledQuantity,
    decimal TotalFulfilledQuantity,
    decimal RemainingQuantity) : DomainEvent;

/// <summary>
/// Stok rezervasyonu iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record StockReservationCancelledDomainEvent(
    int StockReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    int WarehouseId,
    decimal CancelledQuantity,
    string CancelledBy,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Stok rezervasyonu süre dolduğunda tetiklenen event.
/// </summary>
public sealed record StockReservationExpiredDomainEvent(
    int StockReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    int WarehouseId,
    decimal ExpiredQuantity,
    DateTime ExpirationDate) : DomainEvent;
