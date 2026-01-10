using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region SalesOrder Events

/// <summary>
/// Satış siparişi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesOrderCreatedDomainEvent(
    int SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    int CustomerId,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    DateTime OrderDate) : DomainEvent;

/// <summary>
/// Satış siparişi onaylandığında tetiklenen event
/// </summary>
public sealed record SalesOrderConfirmedDomainEvent(
    int SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    int ConfirmedById,
    DateTime ConfirmedAt) : DomainEvent;

/// <summary>
/// Satış siparişi sevk edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderShippedDomainEvent(
    int SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    int ShipmentId,
    string TrackingNumber,
    DateTime ShippedAt) : DomainEvent;

/// <summary>
/// Satış siparişi teslim edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderDeliveredDomainEvent(
    int SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    DateTime DeliveredAt,
    string ReceivedBy) : DomainEvent;

/// <summary>
/// Satış siparişi iptal edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderCancelledDomainEvent(
    int SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Satış siparişi kısmen sevk edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderPartiallyShippedDomainEvent(
    int SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    int ShippedItemCount,
    int TotalItemCount,
    decimal ShippedPercentage) : DomainEvent;

#endregion
