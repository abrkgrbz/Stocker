using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ProductVariant Events

/// <summary>
/// Ürün varyantı oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ProductVariantCreatedDomainEvent(
    int ProductVariantId,
    Guid TenantId,
    int ProductId,
    string VariantCode,
    string VariantName,
    string? SKU,
    decimal PriceAdjustment) : DomainEvent;

/// <summary>
/// Ürün varyantı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ProductVariantUpdatedDomainEvent(
    int ProductVariantId,
    Guid TenantId,
    int ProductId,
    string VariantCode,
    string VariantName,
    decimal PriceAdjustment) : DomainEvent;

/// <summary>
/// Ürün varyantı aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record ProductVariantActivatedDomainEvent(
    int ProductVariantId,
    Guid TenantId,
    int ProductId,
    string VariantCode,
    string VariantName) : DomainEvent;

/// <summary>
/// Ürün varyantı deaktif edildiğinde tetiklenen event.
/// </summary>
public sealed record ProductVariantDeactivatedDomainEvent(
    int ProductVariantId,
    Guid TenantId,
    int ProductId,
    string VariantCode,
    string VariantName) : DomainEvent;

/// <summary>
/// Ürün varyantı stok seviyesi değiştiğinde tetiklenen event.
/// </summary>
public sealed record ProductVariantStockChangedDomainEvent(
    int ProductVariantId,
    Guid TenantId,
    int ProductId,
    string VariantCode,
    decimal OldStock,
    decimal NewStock) : DomainEvent;

/// <summary>
/// Ürün varyantı fiyatı değiştiğinde tetiklenen event.
/// </summary>
public sealed record ProductVariantPriceChangedDomainEvent(
    int ProductVariantId,
    Guid TenantId,
    int ProductId,
    string VariantCode,
    decimal OldPrice,
    decimal NewPrice) : DomainEvent;

#endregion
