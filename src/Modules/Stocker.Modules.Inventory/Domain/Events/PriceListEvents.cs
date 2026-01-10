using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Fiyat listesi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record PriceListCreatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string Code,
    string Name,
    string Currency) : DomainEvent;

/// <summary>
/// Fiyat listesi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record PriceListUpdatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string Code,
    string Name,
    string Currency) : DomainEvent;

/// <summary>
/// Fiyat listesi varsayılan olarak ayarlandığında tetiklenen event.
/// </summary>
public sealed record PriceListSetAsDefaultDomainEvent(
    int PriceListId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Fiyat listesi aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record PriceListActivatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Fiyat listesi pasifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record PriceListDeactivatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Fiyat listesine ürün eklendiğinde tetiklenen event.
/// </summary>
public sealed record PriceListItemAddedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListCode,
    int ProductId,
    decimal Price,
    string Currency) : DomainEvent;

/// <summary>
/// Fiyat listesindeki ürün fiyatı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record PriceListItemUpdatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListCode,
    int ProductId,
    decimal OldPrice,
    decimal NewPrice,
    string Currency) : DomainEvent;

/// <summary>
/// Fiyat listesinden ürün kaldırıldığında tetiklenen event.
/// </summary>
public sealed record PriceListItemRemovedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListCode,
    int ProductId) : DomainEvent;
