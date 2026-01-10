using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Marka oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record BrandCreatedDomainEvent(
    int BrandId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Marka güncellendiğinde tetiklenen event.
/// </summary>
public sealed record BrandUpdatedDomainEvent(
    int BrandId,
    Guid TenantId,
    string Code,
    string Name,
    string? Website) : DomainEvent;

/// <summary>
/// Marka aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record BrandActivatedDomainEvent(
    int BrandId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Marka pasifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record BrandDeactivatedDomainEvent(
    int BrandId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;
