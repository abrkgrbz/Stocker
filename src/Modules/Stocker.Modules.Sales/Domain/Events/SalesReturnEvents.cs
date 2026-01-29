using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region SalesReturn Events

/// <summary>
/// Satış iadesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesReturnCreatedDomainEvent(
    Guid SalesReturnId,
    Guid TenantId,
    string ReturnNumber,
    Guid? SalesOrderId,
    Guid? CustomerId,
    string ReturnReason,
    decimal TotalAmount) : DomainEvent;

/// <summary>
/// Satış iadesi onaylandığında tetiklenen event
/// </summary>
public sealed record SalesReturnApprovedDomainEvent(
    Guid SalesReturnId,
    Guid TenantId,
    string ReturnNumber,
    Guid? ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satış iadesi teslim alındığında tetiklenen event
/// </summary>
public sealed record SalesReturnReceivedDomainEvent(
    Guid SalesReturnId,
    Guid TenantId,
    string ReturnNumber,
    DateTime ReceivedAt,
    string ReceivedBy) : DomainEvent;

/// <summary>
/// Satış iadesi için iade yapıldığında tetiklenen event
/// </summary>
public sealed record SalesReturnRefundedDomainEvent(
    Guid SalesReturnId,
    Guid TenantId,
    string ReturnNumber,
    Guid CreditNoteId,
    decimal RefundAmount,
    DateTime RefundedAt) : DomainEvent;

/// <summary>
/// Satış iadesi reddedildiğinde tetiklenen event
/// </summary>
public sealed record SalesReturnRejectedDomainEvent(
    Guid SalesReturnId,
    Guid TenantId,
    string ReturnNumber,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

#endregion
