using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PurchaseReturn Events

/// <summary>
/// Satın alma iadesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PurchaseReturnCreatedDomainEvent(
    int PurchaseReturnId,
    Guid TenantId,
    string ReturnNumber,
    int PurchaseOrderId,
    int SupplierId,
    string ReturnReason,
    decimal TotalAmount) : DomainEvent;

/// <summary>
/// Satın alma iadesi onaylandığında tetiklenen event
/// </summary>
public sealed record PurchaseReturnApprovedDomainEvent(
    int PurchaseReturnId,
    Guid TenantId,
    string ReturnNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satın alma iadesi gönderildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseReturnShippedDomainEvent(
    int PurchaseReturnId,
    Guid TenantId,
    string ReturnNumber,
    string TrackingNumber,
    DateTime ShippedAt) : DomainEvent;

/// <summary>
/// Satın alma iadesi alındı teyidi geldiğinde tetiklenen event
/// </summary>
public sealed record PurchaseReturnReceivedBySupplierDomainEvent(
    int PurchaseReturnId,
    Guid TenantId,
    string ReturnNumber,
    DateTime ReceivedAt,
    string ConfirmationNumber) : DomainEvent;

/// <summary>
/// İade için kredi notu alındığında tetiklenen event
/// </summary>
public sealed record PurchaseReturnCreditNoteReceivedDomainEvent(
    int PurchaseReturnId,
    Guid TenantId,
    string ReturnNumber,
    int CreditNoteId,
    decimal CreditAmount) : DomainEvent;

#endregion
