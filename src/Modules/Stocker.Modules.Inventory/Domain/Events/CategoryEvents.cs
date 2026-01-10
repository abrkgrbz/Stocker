using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Kategori oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record CategoryCreatedDomainEvent(
    int CategoryId,
    Guid TenantId,
    string Code,
    string Name,
    int? ParentCategoryId) : DomainEvent;

/// <summary>
/// Kategori güncellendiğinde tetiklenen event.
/// </summary>
public sealed record CategoryUpdatedDomainEvent(
    int CategoryId,
    Guid TenantId,
    string Code,
    string Name,
    int? ParentCategoryId) : DomainEvent;

/// <summary>
/// Kategori aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record CategoryActivatedDomainEvent(
    int CategoryId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Kategori pasifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record CategoryDeactivatedDomainEvent(
    int CategoryId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;
