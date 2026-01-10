using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PurchaseRequest Events

/// <summary>
/// Satın alma talebi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PurchaseRequestCreatedDomainEvent(
    int PurchaseRequestId,
    Guid TenantId,
    string RequestNumber,
    int RequestedById,
    string RequestedByName,
    int DepartmentId,
    string Priority) : DomainEvent;

/// <summary>
/// Satın alma talebi onaylandığında tetiklenen event
/// </summary>
public sealed record PurchaseRequestApprovedDomainEvent(
    int PurchaseRequestId,
    Guid TenantId,
    string RequestNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satın alma talebi reddedildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseRequestRejectedDomainEvent(
    int PurchaseRequestId,
    Guid TenantId,
    string RequestNumber,
    int RejectedById,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Satın alma talebi siparişe dönüştürüldüğünde tetiklenen event
/// </summary>
public sealed record PurchaseRequestConvertedToOrderDomainEvent(
    int PurchaseRequestId,
    Guid TenantId,
    string RequestNumber,
    int PurchaseOrderId,
    string OrderNumber) : DomainEvent;

#endregion
