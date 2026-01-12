namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record WorkCenterDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    string Type,
    string Status,
    int Capacity,
    string CapacityUnit,
    decimal EfficiencyRate,
    decimal HourlyLaborCost,
    decimal HourlyMachineCost,
    decimal HourlyOverheadCost,
    decimal TotalHourlyCost,
    decimal OEETarget,
    decimal? LastOEE,
    string? CostCenterId,
    bool IsActive,
    DateTime CreatedDate,
    DateTime? UpdatedDate);

public record WorkCenterListDto(
    int Id,
    string Code,
    string Name,
    string Type,
    string Status,
    int Capacity,
    decimal EfficiencyRate,
    decimal? LastOEE,
    bool IsActive);

public record CreateWorkCenterRequest(
    string Code,
    string Name,
    string? Description,
    string Type,
    int Capacity,
    string CapacityUnit,
    decimal EfficiencyRate,
    decimal HourlyLaborCost,
    decimal HourlyMachineCost,
    decimal HourlyOverheadCost,
    decimal OEETarget,
    string? CostCenterId);

public record UpdateWorkCenterRequest(
    string Name,
    string? Description,
    string Type,
    int Capacity,
    string CapacityUnit,
    decimal EfficiencyRate,
    decimal HourlyLaborCost,
    decimal HourlyMachineCost,
    decimal HourlyOverheadCost,
    decimal OEETarget,
    string? CostCenterId);
