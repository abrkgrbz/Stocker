namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for WarehouseZone entity
/// </summary>
public record WarehouseZoneDto
{
    public int Id { get; init; }
    public int WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ZoneType { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public bool IsTemperatureControlled { get; init; }
    public decimal? MinTemperature { get; init; }
    public decimal? MaxTemperature { get; init; }
    public decimal? TargetTemperature { get; init; }
    public bool RequiresTemperatureMonitoring { get; init; }
    public bool IsHumidityControlled { get; init; }
    public decimal? MinHumidity { get; init; }
    public decimal? MaxHumidity { get; init; }
    public bool IsHazardous { get; init; }
    public string? HazardClass { get; init; }
    public string? UnNumber { get; init; }
    public bool RequiresSpecialAccess { get; init; }
    public int? AccessLevel { get; init; }
    public decimal? TotalArea { get; init; }
    public decimal? UsableArea { get; init; }
    public int? MaxPalletCapacity { get; init; }
    public decimal? MaxHeight { get; init; }
    public decimal? MaxWeightPerArea { get; init; }
    public int Priority { get; init; }
    public bool IsDefaultPickingZone { get; init; }
    public bool IsDefaultPutawayZone { get; init; }
    public bool IsQuarantineZone { get; init; }
    public bool IsReturnsZone { get; init; }
    public int LocationCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// DTO for creating a warehouse zone
/// </summary>
public record CreateWarehouseZoneDto
{
    public int WarehouseId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ZoneType { get; init; } = string.Empty;
    public bool IsTemperatureControlled { get; init; }
    public decimal? MinTemperature { get; init; }
    public decimal? MaxTemperature { get; init; }
    public decimal? TargetTemperature { get; init; }
    public bool RequiresTemperatureMonitoring { get; init; }
    public bool IsHumidityControlled { get; init; }
    public decimal? MinHumidity { get; init; }
    public decimal? MaxHumidity { get; init; }
    public bool IsHazardous { get; init; }
    public string? HazardClass { get; init; }
    public string? UnNumber { get; init; }
    public bool RequiresSpecialAccess { get; init; }
    public int? AccessLevel { get; init; }
    public decimal? TotalArea { get; init; }
    public decimal? UsableArea { get; init; }
    public int? MaxPalletCapacity { get; init; }
    public decimal? MaxHeight { get; init; }
    public int Priority { get; init; }
    public bool IsDefaultPickingZone { get; init; }
    public bool IsDefaultPutawayZone { get; init; }
    public bool IsQuarantineZone { get; init; }
    public bool IsReturnsZone { get; init; }
}

/// <summary>
/// DTO for updating a warehouse zone
/// </summary>
public record UpdateWarehouseZoneDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public bool IsTemperatureControlled { get; init; }
    public decimal? MinTemperature { get; init; }
    public decimal? MaxTemperature { get; init; }
    public decimal? TargetTemperature { get; init; }
    public bool RequiresTemperatureMonitoring { get; init; }
    public bool IsHumidityControlled { get; init; }
    public decimal? MinHumidity { get; init; }
    public decimal? MaxHumidity { get; init; }
    public bool IsHazardous { get; init; }
    public string? HazardClass { get; init; }
    public string? UnNumber { get; init; }
    public bool RequiresSpecialAccess { get; init; }
    public int? AccessLevel { get; init; }
    public decimal? TotalArea { get; init; }
    public decimal? UsableArea { get; init; }
    public int? MaxPalletCapacity { get; init; }
    public decimal? MaxHeight { get; init; }
    public int Priority { get; init; }
    public bool IsDefaultPickingZone { get; init; }
    public bool IsDefaultPutawayZone { get; init; }
    public bool IsQuarantineZone { get; init; }
    public bool IsReturnsZone { get; init; }
}
