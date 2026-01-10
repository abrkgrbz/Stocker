using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region Location Events

/// <summary>
/// Lokasyon oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record LocationCreatedDomainEvent(
    int LocationId,
    Guid TenantId,
    int WarehouseId,
    string Code,
    string Name,
    string? Zone,
    string? Aisle,
    string? Rack,
    string? Shelf) : DomainEvent;

/// <summary>
/// Lokasyon güncellendiğinde tetiklenen event.
/// </summary>
public sealed record LocationUpdatedDomainEvent(
    int LocationId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Lokasyon aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record LocationActivatedDomainEvent(
    int LocationId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Lokasyon deaktif edildiğinde tetiklenen event.
/// </summary>
public sealed record LocationDeactivatedDomainEvent(
    int LocationId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Lokasyon kapasitesi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record LocationCapacityUpdatedDomainEvent(
    int LocationId,
    Guid TenantId,
    string Code,
    decimal? OldCapacity,
    decimal? NewCapacity) : DomainEvent;

/// <summary>
/// Lokasyona ürün atandığında tetiklenen event.
/// </summary>
public sealed record ProductAssignedToLocationDomainEvent(
    int LocationId,
    Guid TenantId,
    int ProductId,
    string LocationCode,
    decimal Quantity) : DomainEvent;

#endregion
