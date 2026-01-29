using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region ServiceOrder Events

/// <summary>
/// Servis siparişi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record ServiceOrderCreatedDomainEvent(
    Guid ServiceOrderId,
    Guid TenantId,
    string OrderNumber,
    Guid? CustomerId,
    string CustomerName,
    string ServiceType,
    string Priority) : DomainEvent;

/// <summary>
/// Servis siparişi atandığında tetiklenen event
/// </summary>
public sealed record ServiceOrderAssignedDomainEvent(
    Guid ServiceOrderId,
    Guid TenantId,
    string OrderNumber,
    Guid? TechnicianId,
    string TechnicianName,
    DateTime ScheduledDate) : DomainEvent;

/// <summary>
/// Servis siparişi başlatıldığında tetiklenen event
/// </summary>
public sealed record ServiceOrderStartedDomainEvent(
    Guid ServiceOrderId,
    Guid TenantId,
    string OrderNumber,
    DateTime StartedAt) : DomainEvent;

/// <summary>
/// Servis siparişi tamamlandığında tetiklenen event
/// </summary>
public sealed record ServiceOrderCompletedDomainEvent(
    Guid ServiceOrderId,
    Guid TenantId,
    string OrderNumber,
    string Resolution,
    decimal ServiceCost,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Servis siparişi iptal edildiğinde tetiklenen event
/// </summary>
public sealed record ServiceOrderCancelledDomainEvent(
    Guid ServiceOrderId,
    Guid TenantId,
    string OrderNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

#endregion
