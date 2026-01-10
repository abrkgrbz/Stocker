using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region PackagingType Events

/// <summary>
/// Ambalaj tipi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record PackagingTypeCreatedDomainEvent(
    int PackagingTypeId,
    Guid TenantId,
    string Code,
    string Name,
    decimal? Weight,
    decimal? Volume) : DomainEvent;

/// <summary>
/// Ambalaj tipi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record PackagingTypeUpdatedDomainEvent(
    int PackagingTypeId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Ambalaj tipi silindiğinde tetiklenen event.
/// </summary>
public sealed record PackagingTypeDeletedDomainEvent(
    int PackagingTypeId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

#endregion
