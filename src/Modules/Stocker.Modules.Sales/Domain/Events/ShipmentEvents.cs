using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Shipment Events

/// <summary>
/// Sevkiyat oluşturulduğunda tetiklenen event
/// </summary>
public sealed record ShipmentCreatedDomainEvent(
    int ShipmentId,
    Guid TenantId,
    string ShipmentNumber,
    int SalesOrderId,
    string CarrierName,
    DateTime PlannedShipDate) : DomainEvent;

/// <summary>
/// Sevkiyat gönderildiğinde tetiklenen event
/// </summary>
public sealed record ShipmentDispatchedDomainEvent(
    int ShipmentId,
    Guid TenantId,
    string ShipmentNumber,
    string TrackingNumber,
    DateTime DispatchedAt) : DomainEvent;

/// <summary>
/// Sevkiyat transit durumunda güncellendiğinde tetiklenen event
/// </summary>
public sealed record ShipmentInTransitUpdatedDomainEvent(
    int ShipmentId,
    Guid TenantId,
    string ShipmentNumber,
    string CurrentLocation,
    string Status,
    DateTime UpdatedAt) : DomainEvent;

/// <summary>
/// Sevkiyat teslim edildiğinde tetiklenen event
/// </summary>
public sealed record ShipmentDeliveredDomainEvent(
    int ShipmentId,
    Guid TenantId,
    string ShipmentNumber,
    DateTime DeliveredAt,
    string ReceivedBy,
    string DeliveryProof) : DomainEvent;

/// <summary>
/// Sevkiyat teslim edilemediğinde tetiklenen event
/// </summary>
public sealed record ShipmentDeliveryFailedDomainEvent(
    int ShipmentId,
    Guid TenantId,
    string ShipmentNumber,
    string FailureReason,
    DateTime FailedAt) : DomainEvent;

#endregion
