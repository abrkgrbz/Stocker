using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region InventoryReservation Events

/// <summary>
/// Stok rezervasyonu oluşturulduğunda tetiklenen event
/// </summary>
public sealed record InventoryReservationCreatedDomainEvent(
    Guid ReservationId,
    Guid TenantId,
    string ReservationNumber,
    Guid? SalesOrderId,
    Guid? ProductId,
    string ProductName,
    decimal ReservedQuantity,
    DateTime ExpiresAt) : DomainEvent;

/// <summary>
/// Stok rezervasyonu onaylandığında tetiklenen event
/// </summary>
public sealed record InventoryReservationConfirmedDomainEvent(
    Guid ReservationId,
    Guid TenantId,
    string ReservationNumber,
    Guid? ProductId,
    decimal ConfirmedQuantity) : DomainEvent;

/// <summary>
/// Stok rezervasyonu serbest bırakıldığında tetiklenen event
/// </summary>
public sealed record InventoryReservationReleasedDomainEvent(
    Guid ReservationId,
    Guid TenantId,
    string ReservationNumber,
    Guid? ProductId,
    decimal ReleasedQuantity,
    string ReleaseReason) : DomainEvent;

/// <summary>
/// Stok rezervasyonu süresi dolduğunda tetiklenen event
/// </summary>
public sealed record InventoryReservationExpiredDomainEvent(
    Guid ReservationId,
    Guid TenantId,
    string ReservationNumber,
    Guid? ProductId,
    decimal ExpiredQuantity,
    DateTime ExpiredAt) : DomainEvent;

#endregion
