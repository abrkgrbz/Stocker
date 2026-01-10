using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region WarehouseZone Events

/// <summary>
/// Depo bölgesi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record WarehouseZoneCreatedDomainEvent(
    int WarehouseZoneId,
    Guid TenantId,
    int WarehouseId,
    string Code,
    string Name,
    string? ZoneType) : DomainEvent;

/// <summary>
/// Depo bölgesi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record WarehouseZoneUpdatedDomainEvent(
    int WarehouseZoneId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Depo bölgesi aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record WarehouseZoneActivatedDomainEvent(
    int WarehouseZoneId,
    Guid TenantId,
    int WarehouseId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Depo bölgesi deaktif edildiğinde tetiklenen event.
/// </summary>
public sealed record WarehouseZoneDeactivatedDomainEvent(
    int WarehouseZoneId,
    Guid TenantId,
    int WarehouseId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Depo bölgesi kapasitesi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record WarehouseZoneCapacityUpdatedDomainEvent(
    int WarehouseZoneId,
    Guid TenantId,
    string Code,
    decimal? OldCapacity,
    decimal? NewCapacity) : DomainEvent;

/// <summary>
/// Depo bölgesi sıcaklık limitleri ayarlandığında tetiklenen event.
/// </summary>
public sealed record WarehouseZoneTemperatureLimitsSetDomainEvent(
    int WarehouseZoneId,
    Guid TenantId,
    string Code,
    decimal? MinTemperature,
    decimal? MaxTemperature) : DomainEvent;

#endregion
