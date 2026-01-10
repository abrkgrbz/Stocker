using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region Quotation Events

/// <summary>
/// Teklif talebi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record QuotationRequestCreatedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int SupplierId,
    string SupplierName,
    DateTime DueDate) : DomainEvent;

/// <summary>
/// Teklif alındığında tetiklenen event
/// </summary>
public sealed record QuotationReceivedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int SupplierId,
    string SupplierName,
    decimal TotalAmount,
    string Currency,
    DateTime ValidUntil) : DomainEvent;

/// <summary>
/// Teklif kabul edildiğinde tetiklenen event
/// </summary>
public sealed record QuotationAcceptedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int SupplierId,
    decimal AcceptedAmount,
    int PurchaseOrderId) : DomainEvent;

/// <summary>
/// Teklif reddedildiğinde tetiklenen event
/// </summary>
public sealed record QuotationRejectedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int SupplierId,
    string RejectionReason) : DomainEvent;

/// <summary>
/// Teklif süresi dolduğunda tetiklenen event
/// </summary>
public sealed record QuotationExpiredDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int SupplierId,
    DateTime ExpiredAt) : DomainEvent;

#endregion
