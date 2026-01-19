namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Location entity
/// </summary>
public class LocationDto
{
    public int Id { get; set; }
    public int WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Aisle { get; set; }
    public string? Shelf { get; set; }
    public string? Bin { get; set; }
    public decimal Capacity { get; set; }
    public decimal UsedCapacity { get; set; }
    public decimal AvailableCapacity { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ProductCount { get; set; }
}

/// <summary>
/// DTO for creating a location
/// </summary>
public class CreateLocationDto
{
    public int WarehouseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Aisle { get; set; }
    public string? Shelf { get; set; }
    public string? Bin { get; set; }
    public decimal Capacity { get; set; }
}

/// <summary>
/// DTO for updating a location
/// </summary>
public class UpdateLocationDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Aisle { get; set; }
    public string? Shelf { get; set; }
    public string? Bin { get; set; }
    public decimal Capacity { get; set; }
}

/// <summary>
/// DTO for location listing (lightweight)
/// </summary>
public class LocationListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? WarehouseName { get; set; }
    public string? Aisle { get; set; }
    public string? Shelf { get; set; }
    public string? Bin { get; set; }
    public string FullPath { get; set; } = string.Empty; // Aisle-Shelf-Bin
    public decimal Capacity { get; set; }
    public decimal UsedCapacity { get; set; }
    public decimal CapacityUsagePercent { get; set; }
    public bool IsActive { get; set; }
}
