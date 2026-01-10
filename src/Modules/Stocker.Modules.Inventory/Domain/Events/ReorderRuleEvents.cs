using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ReorderRule Events

/// <summary>
/// Yeniden sipariş kuralı oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ReorderRuleCreatedDomainEvent(
    int ReorderRuleId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal MinimumStock,
    decimal ReorderPoint,
    decimal ReorderQuantity) : DomainEvent;

/// <summary>
/// Yeniden sipariş kuralı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ReorderRuleUpdatedDomainEvent(
    int ReorderRuleId,
    Guid TenantId,
    int ProductId,
    decimal MinimumStock,
    decimal ReorderPoint,
    decimal ReorderQuantity) : DomainEvent;

/// <summary>
/// Yeniden sipariş noktasına ulaşıldığında tetiklenen event.
/// </summary>
public sealed record ReorderPointReachedDomainEvent(
    int ReorderRuleId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal CurrentStock,
    decimal ReorderPoint,
    decimal SuggestedQuantity) : DomainEvent;

/// <summary>
/// Yeniden sipariş kuralı aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record ReorderRuleActivatedDomainEvent(
    int ReorderRuleId,
    Guid TenantId,
    int ProductId,
    int WarehouseId) : DomainEvent;

/// <summary>
/// Yeniden sipariş kuralı deaktif edildiğinde tetiklenen event.
/// </summary>
public sealed record ReorderRuleDeactivatedDomainEvent(
    int ReorderRuleId,
    Guid TenantId,
    int ProductId,
    int WarehouseId) : DomainEvent;

/// <summary>
/// Yeniden sipariş kuralı silindiğinde tetiklenen event.
/// </summary>
public sealed record ReorderRuleDeletedDomainEvent(
    int ReorderRuleId,
    Guid TenantId,
    int ProductId,
    int WarehouseId) : DomainEvent;

#endregion
