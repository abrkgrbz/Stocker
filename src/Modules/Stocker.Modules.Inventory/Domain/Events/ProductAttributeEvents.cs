using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ProductAttribute Events

/// <summary>
/// Ürün özelliği oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ProductAttributeCreatedDomainEvent(
    int ProductAttributeId,
    Guid TenantId,
    int ProductId,
    string AttributeName,
    string AttributeValue) : DomainEvent;

/// <summary>
/// Ürün özelliği güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ProductAttributeUpdatedDomainEvent(
    int ProductAttributeId,
    Guid TenantId,
    int ProductId,
    string AttributeName,
    string OldValue,
    string NewValue) : DomainEvent;

/// <summary>
/// Ürün özelliği silindiğinde tetiklenen event.
/// </summary>
public sealed record ProductAttributeDeletedDomainEvent(
    int ProductAttributeId,
    Guid TenantId,
    int ProductId,
    string AttributeName) : DomainEvent;

#endregion
