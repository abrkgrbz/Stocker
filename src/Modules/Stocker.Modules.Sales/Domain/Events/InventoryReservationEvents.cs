using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region InventoryReservation Events

/// <summary>
/// Stok rezervasyonu oluşturulduğunda tetiklenen event
/// </summary>
public sealed record InventoryReservationCreatedDomainEvent(
    int ReservationId,
    Guid TenantId,
    string ReservationNumber,
    int SalesOrderId,
    int ProductId,
    string ProductName,
    decimal ReservedQuantity,
    DateTime ExpiresAt) : DomainEvent;

/// <summary>
/// Stok rezervasyonu onaylandığında tetiklenen event
/// </summary>
public sealed record InventoryReservationConfirmedDomainEvent(
    int ReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    decimal ConfirmedQuantity) : DomainEvent;

/// <summary>
/// Stok rezervasyonu serbest bırakıldığında tetiklenen event
/// </summary>
public sealed record InventoryReservationReleasedDomainEvent(
    int ReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    decimal ReleasedQuantity,
    string ReleaseReason) : DomainEvent;

/// <summary>
/// Stok rezervasyonu süresi dolduğunda tetiklenen event
/// </summary>
public sealed record InventoryReservationExpiredDomainEvent(
    int ReservationId,
    Guid TenantId,
    string ReservationNumber,
    int ProductId,
    decimal ExpiredQuantity,
    DateTime ExpiredAt) : DomainEvent;

#endregion
