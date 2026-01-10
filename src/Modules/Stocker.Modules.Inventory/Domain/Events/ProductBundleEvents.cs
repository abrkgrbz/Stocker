using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ProductBundle Events

/// <summary>
/// Ürün paketi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ProductBundleCreatedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    int BundleProductId,
    string BundleName,
    decimal BundlePrice,
    int ComponentCount) : DomainEvent;

/// <summary>
/// Ürün paketi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ProductBundleUpdatedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    string BundleName,
    decimal BundlePrice) : DomainEvent;

/// <summary>
/// Pakete bileşen eklendiğinde tetiklenen event.
/// </summary>
public sealed record BundleComponentAddedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    int ComponentProductId,
    string ComponentName,
    decimal Quantity) : DomainEvent;

/// <summary>
/// Paketten bileşen çıkarıldığında tetiklenen event.
/// </summary>
public sealed record BundleComponentRemovedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    int ComponentProductId,
    string ComponentName) : DomainEvent;

/// <summary>
/// Paket bileşen miktarı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record BundleComponentQuantityUpdatedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    int ComponentProductId,
    decimal OldQuantity,
    decimal NewQuantity) : DomainEvent;

/// <summary>
/// Ürün paketi aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record ProductBundleActivatedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    string BundleName) : DomainEvent;

/// <summary>
/// Ürün paketi deaktif edildiğinde tetiklenen event.
/// </summary>
public sealed record ProductBundleDeactivatedDomainEvent(
    int ProductBundleId,
    Guid TenantId,
    string BundleName) : DomainEvent;

#endregion
