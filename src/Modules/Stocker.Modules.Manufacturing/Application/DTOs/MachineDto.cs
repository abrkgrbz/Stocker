namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record MachineDto(
    int Id,
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    string Code,
    string Name,
    string? Description,
    string Status,
    string? Manufacturer,
    string? Model,
    string? SerialNumber,
    decimal HourlyCapacity,
    decimal EfficiencyRate,
    decimal HourlyCost,
    decimal SetupCost,
    decimal MaintenanceCostPerHour,
    decimal PowerConsumptionKw,
    decimal AvailabilityRate,
    decimal PerformanceRate,
    decimal QualityRate,
    decimal OEE,
    decimal TotalOperatingHours,
    DateTime? PurchaseDate,
    DateTime? InstallationDate,
    DateTime? WarrantyExpiryDate,
    DateTime? LastMaintenanceDate,
    DateTime? NextMaintenanceDate,
    int? MaintenanceIntervalDays,
    int DisplayOrder,
    bool IsActive,
    DateTime CreatedDate);

public record MachineListDto(
    int Id,
    string Code,
    string Name,
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    string Status,
    decimal EfficiencyRate,
    decimal OEE,
    DateTime? NextMaintenanceDate,
    bool IsActive);

public record CreateMachineRequest(
    int WorkCenterId,
    string Code,
    string Name,
    string? Description = null,
    string? Manufacturer = null,
    string? Model = null,
    string? SerialNumber = null,
    decimal HourlyCapacity = 1,
    decimal EfficiencyRate = 100,
    decimal HourlyCost = 0,
    decimal SetupCost = 0,
    decimal MaintenanceCostPerHour = 0,
    decimal PowerConsumptionKw = 0,
    DateTime? PurchaseDate = null,
    DateTime? InstallationDate = null,
    DateTime? WarrantyExpiryDate = null,
    int? MaintenanceIntervalDays = null);

public record UpdateMachineRequest(
    string Name,
    string? Description,
    string? Manufacturer,
    string? Model,
    string? SerialNumber,
    decimal HourlyCapacity,
    decimal EfficiencyRate,
    decimal HourlyCost,
    decimal SetupCost,
    decimal MaintenanceCostPerHour,
    decimal PowerConsumptionKw,
    int? MaintenanceIntervalDays);

public record UpdateMachineStatusRequest(
    string Status,
    string? Reason);

public record RecordMachineOEERequest(
    decimal AvailabilityRate,
    decimal PerformanceRate,
    decimal QualityRate);

public record RecordMaintenanceRequest(
    DateTime MaintenanceDate,
    string? Notes);
