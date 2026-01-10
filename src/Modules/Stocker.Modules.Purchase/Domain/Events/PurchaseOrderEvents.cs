using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PurchaseOrder Events

/// <summary>
/// Satın alma siparişi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PurchaseOrderCreatedDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    int SupplierId,
    string SupplierName,
    decimal TotalAmount,
    string Currency,
    DateTime ExpectedDeliveryDate) : DomainEvent;

/// <summary>
/// Satın alma siparişi onaylandığında tetiklenen event
/// </summary>
public sealed record PurchaseOrderApprovedDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satın alma siparişi tedarikçiye gönderildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseOrderSentToSupplierDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    string SupplierName,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Satın alma siparişi teslim alındığında tetiklenen event
/// </summary>
public sealed record PurchaseOrderReceivedDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    int GoodsReceiptId,
    DateTime ReceivedAt) : DomainEvent;

/// <summary>
/// Satın alma siparişi kısmen teslim alındığında tetiklenen event
/// </summary>
public sealed record PurchaseOrderPartiallyReceivedDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    int ReceivedItemCount,
    int TotalItemCount,
    decimal ReceivedPercentage) : DomainEvent;

/// <summary>
/// Satın alma siparişi iptal edildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseOrderCancelledDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Satın alma siparişi kapatıldığında tetiklenen event
/// </summary>
public sealed record PurchaseOrderClosedDomainEvent(
    int PurchaseOrderId,
    Guid TenantId,
    string OrderNumber,
    DateTime ClosedAt) : DomainEvent;

#endregion
