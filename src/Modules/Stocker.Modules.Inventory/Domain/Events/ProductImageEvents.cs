using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ProductImage Events

/// <summary>
/// Ürün görseli eklendiğinde tetiklenen event.
/// </summary>
public sealed record ProductImageAddedDomainEvent(
    int ProductImageId,
    Guid TenantId,
    int ProductId,
    string ImageUrl,
    bool IsPrimary,
    int DisplayOrder) : DomainEvent;

/// <summary>
/// Ürün görseli güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ProductImageUpdatedDomainEvent(
    int ProductImageId,
    Guid TenantId,
    int ProductId,
    string ImageUrl,
    int DisplayOrder) : DomainEvent;

/// <summary>
/// Ürün görseli birincil olarak ayarlandığında tetiklenen event.
/// </summary>
public sealed record ProductImageSetAsPrimaryDomainEvent(
    int ProductImageId,
    Guid TenantId,
    int ProductId,
    string ImageUrl) : DomainEvent;

/// <summary>
/// Ürün görseli silindiğinde tetiklenen event.
/// </summary>
public sealed record ProductImageDeletedDomainEvent(
    int ProductImageId,
    Guid TenantId,
    int ProductId,
    string ImageUrl) : DomainEvent;

/// <summary>
/// Ürün görselleri yeniden sıralandığında tetiklenen event.
/// </summary>
public sealed record ProductImagesReorderedDomainEvent(
    Guid TenantId,
    int ProductId,
    int ImageCount) : DomainEvent;

#endregion
