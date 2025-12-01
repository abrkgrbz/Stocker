namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Unit entity
/// </summary>
public class UnitDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Symbol { get; set; }
    public int? BaseUnitId { get; set; }
    public string? BaseUnitName { get; set; }
    public decimal ConversionFactor { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<UnitDto> DerivedUnits { get; set; } = new();
}

/// <summary>
/// DTO for creating a unit
/// </summary>
public class CreateUnitDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Symbol { get; set; }
    public int? BaseUnitId { get; set; }
    public decimal ConversionFactor { get; set; } = 1;
}

/// <summary>
/// DTO for updating a unit
/// </summary>
public class UpdateUnitDto
{
    public string Name { get; set; } = string.Empty;
    public string? Symbol { get; set; }
    public int? BaseUnitId { get; set; }
    public decimal ConversionFactor { get; set; }
}

/// <summary>
/// DTO for unit listing (lightweight)
/// </summary>
public class UnitListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Symbol { get; set; }
    public bool IsBaseUnit { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for unit conversion
/// </summary>
public class UnitConversionDto
{
    public int FromUnitId { get; set; }
    public string FromUnitName { get; set; } = string.Empty;
    public int ToUnitId { get; set; }
    public string ToUnitName { get; set; } = string.Empty;
    public decimal ConversionFactor { get; set; }
}
