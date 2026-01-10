using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ReorderSuggestion Events

/// <summary>
/// Yeniden sipariş önerisi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ReorderSuggestionCreatedDomainEvent(
    int ReorderSuggestionId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal SuggestedQuantity,
    decimal CurrentStock,
    int? PreferredSupplierId) : DomainEvent;

/// <summary>
/// Yeniden sipariş önerisi onaylandığında tetiklenen event.
/// </summary>
public sealed record ReorderSuggestionApprovedDomainEvent(
    int ReorderSuggestionId,
    Guid TenantId,
    int ProductId,
    decimal ApprovedQuantity,
    int ApprovedById,
    int? PurchaseOrderId) : DomainEvent;

/// <summary>
/// Yeniden sipariş önerisi reddedildiğinde tetiklenen event.
/// </summary>
public sealed record ReorderSuggestionRejectedDomainEvent(
    int ReorderSuggestionId,
    Guid TenantId,
    int ProductId,
    int RejectedById,
    string RejectionReason) : DomainEvent;

/// <summary>
/// Yeniden sipariş önerisi satın alma siparişine dönüştürüldüğünde tetiklenen event.
/// </summary>
public sealed record ReorderSuggestionConvertedToPurchaseOrderDomainEvent(
    int ReorderSuggestionId,
    Guid TenantId,
    int ProductId,
    int PurchaseOrderId,
    decimal OrderedQuantity) : DomainEvent;

/// <summary>
/// Yeniden sipariş önerisi iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record ReorderSuggestionCancelledDomainEvent(
    int ReorderSuggestionId,
    Guid TenantId,
    int ProductId,
    string CancellationReason) : DomainEvent;

/// <summary>
/// Yeniden sipariş önerisi süresi dolduğunda tetiklenen event.
/// </summary>
public sealed record ReorderSuggestionExpiredDomainEvent(
    int ReorderSuggestionId,
    Guid TenantId,
    int ProductId,
    DateTime ExpiryDate) : DomainEvent;

#endregion
