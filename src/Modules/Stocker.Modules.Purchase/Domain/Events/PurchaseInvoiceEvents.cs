using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PurchaseInvoice Events

/// <summary>
/// Satın alma faturası oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PurchaseInvoiceCreatedDomainEvent(
    int PurchaseInvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int SupplierId,
    string SupplierName,
    decimal TotalAmount,
    string Currency,
    DateTime InvoiceDate) : DomainEvent;

/// <summary>
/// Satın alma faturası onaylandığında tetiklenen event
/// </summary>
public sealed record PurchaseInvoiceApprovedDomainEvent(
    int PurchaseInvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satın alma faturası sipariş ile eşleştirildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseInvoiceMatchedWithOrderDomainEvent(
    int PurchaseInvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int PurchaseOrderId,
    string OrderNumber,
    string MatchStatus) : DomainEvent;

/// <summary>
/// Satın alma faturası ödendiğinde tetiklenen event
/// </summary>
public sealed record PurchaseInvoicePaidDomainEvent(
    int PurchaseInvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int PaymentId,
    decimal PaidAmount,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Satın alma faturası itiraz edildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseInvoiceDisputedDomainEvent(
    int PurchaseInvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    string DisputeReason,
    DateTime DisputedAt) : DomainEvent;

#endregion
