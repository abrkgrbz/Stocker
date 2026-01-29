using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region SalesOrder Events

/// <summary>
/// Satış siparişi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesOrderCreatedDomainEvent(
    Guid SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    Guid? CustomerId,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    DateTime OrderDate) : DomainEvent;

/// <summary>
/// Satış siparişi onaylandığında tetiklenen event
/// </summary>
public sealed record SalesOrderConfirmedDomainEvent(
    Guid SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    Guid? ConfirmedById,
    DateTime ConfirmedAt) : DomainEvent;

/// <summary>
/// Satış siparişi sevk edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderShippedDomainEvent(
    Guid SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    Guid ShipmentId,
    string TrackingNumber,
    DateTime ShippedAt) : DomainEvent;

/// <summary>
/// Satış siparişi teslim edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderDeliveredDomainEvent(
    Guid SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    DateTime DeliveredAt,
    string ReceivedBy) : DomainEvent;

/// <summary>
/// Satış siparişi iptal edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderCancelledDomainEvent(
    Guid SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Satış siparişi kısmen sevk edildiğinde tetiklenen event
/// </summary>
public sealed record SalesOrderPartiallyShippedDomainEvent(
    Guid SalesOrderId,
    Guid TenantId,
    string OrderNumber,
    int ShippedItemCount,
    int TotalItemCount,
    decimal ShippedPercentage) : DomainEvent;

#endregion
