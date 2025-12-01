namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Warehouse entity
/// </summary>
public class WarehouseDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? BranchId { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Phone { get; set; }
    public string? Manager { get; set; }
    public decimal TotalArea { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int LocationCount { get; set; }
    public int ProductCount { get; set; }
    public decimal TotalStockValue { get; set; }
    public List<LocationDto> Locations { get; set; } = new();
}

/// <summary>
/// DTO for creating a warehouse
/// </summary>
public class CreateWarehouseDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? BranchId { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Phone { get; set; }
    public string? Manager { get; set; }
    public decimal TotalArea { get; set; }
    public bool IsDefault { get; set; }
}

/// <summary>
/// DTO for updating a warehouse
/// </summary>
public class UpdateWarehouseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? BranchId { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Phone { get; set; }
    public string? Manager { get; set; }
    public decimal TotalArea { get; set; }
}

/// <summary>
/// DTO for warehouse listing (lightweight)
/// </summary>
public class WarehouseListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? City { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int LocationCount { get; set; }
}
