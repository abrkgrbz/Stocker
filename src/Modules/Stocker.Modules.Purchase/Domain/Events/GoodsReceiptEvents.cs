using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region GoodsReceipt Events

/// <summary>
/// Mal kabul belgesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record GoodsReceiptCreatedDomainEvent(
    int GoodsReceiptId,
    Guid TenantId,
    string ReceiptNumber,
    int PurchaseOrderId,
    string OrderNumber,
    int SupplierId,
    DateTime ReceiptDate) : DomainEvent;

/// <summary>
/// Mal kabul belgesi onaylandığında tetiklenen event
/// </summary>
public sealed record GoodsReceiptApprovedDomainEvent(
    int GoodsReceiptId,
    Guid TenantId,
    string ReceiptNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Kalite kontrolü tamamlandığında tetiklenen event
/// </summary>
public sealed record QualityInspectionCompletedDomainEvent(
    int GoodsReceiptId,
    Guid TenantId,
    string ReceiptNumber,
    int PassedQuantity,
    int FailedQuantity,
    string InspectionResult) : DomainEvent;

/// <summary>
/// Mal kabul uyumsuzluğu tespit edildiğinde tetiklenen event
/// </summary>
public sealed record GoodsReceiptDiscrepancyFoundDomainEvent(
    int GoodsReceiptId,
    Guid TenantId,
    string ReceiptNumber,
    string DiscrepancyType,
    string Description,
    decimal QuantityDifference) : DomainEvent;

#endregion
