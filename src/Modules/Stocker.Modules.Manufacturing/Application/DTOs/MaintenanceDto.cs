using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Application.DTOs;

#region Maintenance Plan DTOs

public record MaintenancePlanDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    int? MachineId,
    string? MachineName,
    int? WorkCenterId,
    string? WorkCenterName,
    MaintenanceType MaintenanceType,
    MaintenancePriority Priority,
    MaintenancePlanStatus Status,
    MaintenanceTriggerType TriggerType,
    int FrequencyValue,
    MaintenanceFrequencyUnit FrequencyUnit,
    decimal? TriggerMeterValue,
    decimal? WarningThreshold,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo,
    DateTime? LastExecutionDate,
    DateTime? NextScheduledDate,
    decimal EstimatedDurationHours,
    decimal EstimatedLaborCost,
    decimal EstimatedMaterialCost,
    decimal TotalEstimatedCost,
    string? Instructions,
    string? SafetyNotes,
    bool IsActive,
    string? ApprovedByUser,
    DateTime? ApprovedDate,
    IReadOnlyList<MaintenanceTaskDto>? Tasks,
    IReadOnlyList<MaintenancePlanSparePartDto>? RequiredSpareParts
);

public record MaintenancePlanListDto(
    int Id,
    string Code,
    string Name,
    int? MachineId,
    string? MachineName,
    int? WorkCenterId,
    string? WorkCenterName,
    MaintenanceType MaintenanceType,
    MaintenancePriority Priority,
    MaintenancePlanStatus Status,
    DateTime? NextScheduledDate,
    decimal TotalEstimatedCost,
    bool IsActive
);

public record CreateMaintenancePlanRequest(
    string Code,
    string Name,
    string? Description,
    int? MachineId,
    int? WorkCenterId,
    MaintenanceType MaintenanceType,
    MaintenancePriority Priority,
    MaintenanceTriggerType TriggerType,
    int FrequencyValue,
    MaintenanceFrequencyUnit FrequencyUnit,
    decimal? TriggerMeterValue,
    decimal? WarningThreshold,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo,
    decimal EstimatedDurationHours,
    decimal EstimatedLaborCost,
    decimal EstimatedMaterialCost,
    string? Instructions,
    string? SafetyNotes
);

public record UpdateMaintenancePlanRequest(
    string Name,
    string? Description,
    int? MachineId,
    int? WorkCenterId,
    MaintenancePriority Priority,
    int FrequencyValue,
    MaintenanceFrequencyUnit FrequencyUnit,
    decimal? TriggerMeterValue,
    decimal? WarningThreshold,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo,
    decimal EstimatedDurationHours,
    decimal EstimatedLaborCost,
    decimal EstimatedMaterialCost,
    string? Instructions,
    string? SafetyNotes
);

#endregion

#region Maintenance Task DTOs

public record MaintenanceTaskDto(
    int Id,
    int MaintenancePlanId,
    int SequenceNumber,
    string TaskName,
    string? Description,
    MaintenanceTaskStatus Status,
    decimal EstimatedDurationMinutes,
    string? RequiredSkills,
    string? RequiredTools,
    bool IsChecklistItem,
    string? ChecklistCriteria,
    string? AcceptanceValue,
    bool IsMandatory,
    bool IsActive
);

public record CreateMaintenanceTaskRequest(
    int MaintenancePlanId,
    string TaskName,
    string? Description,
    decimal EstimatedDurationMinutes,
    string? RequiredSkills,
    string? RequiredTools,
    bool IsChecklistItem,
    string? ChecklistCriteria,
    string? AcceptanceValue,
    bool IsMandatory
);

public record UpdateMaintenanceTaskRequest(
    string TaskName,
    string? Description,
    decimal EstimatedDurationMinutes,
    string? RequiredSkills,
    string? RequiredTools,
    bool IsChecklistItem,
    string? ChecklistCriteria,
    string? AcceptanceValue,
    bool IsMandatory
);

#endregion

#region Maintenance Record DTOs

public record MaintenanceRecordDto(
    int Id,
    string RecordNumber,
    int? MaintenancePlanId,
    string? MaintenancePlanName,
    int? MachineId,
    string? MachineName,
    int? WorkCenterId,
    string? WorkCenterName,
    MaintenanceType MaintenanceType,
    MaintenanceRecordStatus Status,
    MaintenancePriority Priority,
    DateTime ScheduledDate,
    DateTime? StartDate,
    DateTime? EndDate,
    decimal? ActualDurationHours,
    string? FailureCode,
    string? FailureDescription,
    string? RootCause,
    string? WorkPerformed,
    string? PartsReplaced,
    string? TechnicianNotes,
    decimal LaborCost,
    decimal MaterialCost,
    decimal ExternalServiceCost,
    decimal TotalCost,
    decimal? MeterReadingBefore,
    decimal? MeterReadingAfter,
    string? AssignedTechnician,
    string? PerformedBy,
    string? ApprovedBy,
    DateTime? ApprovedDate,
    string? NextActionRecommendation,
    DateTime? RecommendedNextDate,
    IReadOnlyList<MaintenanceRecordTaskDto>? RecordTasks,
    IReadOnlyList<MaintenanceRecordSparePartDto>? UsedSpareParts
);

public record MaintenanceRecordListDto(
    int Id,
    string RecordNumber,
    int? MachineId,
    string? MachineName,
    int? WorkCenterId,
    string? WorkCenterName,
    MaintenanceType MaintenanceType,
    MaintenanceRecordStatus Status,
    MaintenancePriority Priority,
    DateTime ScheduledDate,
    DateTime? EndDate,
    decimal TotalCost,
    string? AssignedTechnician
);

public record CreateMaintenanceRecordRequest(
    int? MaintenancePlanId,
    int? MachineId,
    int? WorkCenterId,
    MaintenanceType MaintenanceType,
    MaintenancePriority Priority,
    DateTime ScheduledDate,
    string? FailureCode,
    string? FailureDescription,
    string? AssignedTechnician
);

public record UpdateMaintenanceRecordRequest(
    MaintenancePriority Priority,
    string? FailureCode,
    string? FailureDescription,
    string? RootCause,
    string? WorkPerformed,
    string? PartsReplaced,
    string? TechnicianNotes,
    decimal LaborCost,
    decimal MaterialCost,
    decimal ExternalServiceCost,
    decimal? MeterReadingBefore,
    decimal? MeterReadingAfter,
    string? NextActionRecommendation,
    DateTime? RecommendedNextDate
);

public record StartMaintenanceRecordRequest(
    DateTime StartDate,
    string? AssignedTechnician,
    decimal? MeterReadingBefore
);

public record CompleteMaintenanceRecordRequest(
    DateTime EndDate,
    string PerformedBy,
    string? WorkPerformed,
    string? PartsReplaced,
    string? TechnicianNotes,
    decimal LaborCost,
    decimal MaterialCost,
    decimal ExternalServiceCost,
    decimal? MeterReadingAfter,
    string? NextActionRecommendation,
    DateTime? RecommendedNextDate
);

#endregion

#region Maintenance Record Task DTOs

public record MaintenanceRecordTaskDto(
    int Id,
    int MaintenanceRecordId,
    int MaintenanceTaskId,
    string TaskName,
    int SequenceNumber,
    bool IsCompleted,
    DateTime? CompletedDate,
    string? CompletedBy,
    string? MeasuredValue,
    bool? PassedCheck,
    string? Notes
);

public record CompleteMaintenanceRecordTaskRequest(
    string CompletedBy,
    string? MeasuredValue,
    bool? PassedCheck,
    string? Notes
);

#endregion

#region Spare Part DTOs

public record SparePartDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    string? Category,
    string? SubCategory,
    SparePartCriticality Criticality,
    SparePartStatus Status,
    string? PartNumber,
    string? Manufacturer,
    string? ManufacturerPartNo,
    string? AlternativePartNo,
    int? InventoryItemId,
    string? Unit,
    decimal MinimumStock,
    decimal ReorderPoint,
    decimal ReorderQuantity,
    int LeadTimeDays,
    decimal UnitCost,
    decimal? LastPurchasePrice,
    string? CompatibleMachines,
    string? CompatibleModels,
    int? ShelfLifeMonths,
    string? StorageConditions,
    bool IsActive
);

public record SparePartListDto(
    int Id,
    string Code,
    string Name,
    string? Category,
    SparePartCriticality Criticality,
    SparePartStatus Status,
    string? Manufacturer,
    decimal UnitCost,
    decimal ReorderPoint,
    bool IsActive
);

public record CreateSparePartRequest(
    string Code,
    string Name,
    string? Description,
    string? Category,
    string? SubCategory,
    SparePartCriticality Criticality,
    string? PartNumber,
    string? Manufacturer,
    string? ManufacturerPartNo,
    string? AlternativePartNo,
    int? InventoryItemId,
    string? Unit,
    decimal MinimumStock,
    decimal ReorderPoint,
    decimal ReorderQuantity,
    int LeadTimeDays,
    decimal UnitCost,
    string? CompatibleMachines,
    string? CompatibleModels,
    int? ShelfLifeMonths,
    string? StorageConditions
);

public record UpdateSparePartRequest(
    string Name,
    string? Description,
    string? Category,
    string? SubCategory,
    SparePartCriticality Criticality,
    string? PartNumber,
    string? Manufacturer,
    string? ManufacturerPartNo,
    string? AlternativePartNo,
    int? InventoryItemId,
    string? Unit,
    decimal MinimumStock,
    decimal ReorderPoint,
    decimal ReorderQuantity,
    int LeadTimeDays,
    decimal UnitCost,
    string? CompatibleMachines,
    string? CompatibleModels,
    int? ShelfLifeMonths,
    string? StorageConditions
);

#endregion

#region Maintenance Plan Spare Part DTOs

public record MaintenancePlanSparePartDto(
    int Id,
    int MaintenancePlanId,
    int SparePartId,
    string SparePartCode,
    string SparePartName,
    decimal RequiredQuantity,
    bool IsMandatory,
    string? Notes
);

public record AddMaintenancePlanSparePartRequest(
    int MaintenancePlanId,
    int SparePartId,
    decimal RequiredQuantity,
    bool IsMandatory,
    string? Notes
);

#endregion

#region Maintenance Record Spare Part DTOs

public record MaintenanceRecordSparePartDto(
    int Id,
    int MaintenanceRecordId,
    int SparePartId,
    string SparePartCode,
    string SparePartName,
    decimal UsedQuantity,
    decimal UnitCost,
    decimal TotalCost,
    string? LotNumber,
    string? SerialNumber,
    string? Notes
);

public record AddMaintenanceRecordSparePartRequest(
    int MaintenanceRecordId,
    int SparePartId,
    decimal UsedQuantity,
    decimal UnitCost,
    string? LotNumber,
    string? SerialNumber,
    string? Notes
);

#endregion

#region Machine Counter DTOs

public record MachineCounterDto(
    int Id,
    int MachineId,
    string MachineName,
    string CounterName,
    string? CounterUnit,
    decimal CurrentValue,
    decimal? PreviousValue,
    DateTime LastUpdated,
    decimal? ResetValue,
    DateTime? LastResetDate,
    decimal? WarningThreshold,
    decimal? CriticalThreshold,
    bool IsWarning,
    bool IsCritical
);

public record MachineCounterListDto(
    int Id,
    int MachineId,
    string MachineName,
    string CounterName,
    decimal CurrentValue,
    decimal? WarningThreshold,
    decimal? CriticalThreshold,
    bool IsWarning,
    bool IsCritical
);

public record CreateMachineCounterRequest(
    int MachineId,
    string CounterName,
    string? CounterUnit,
    decimal InitialValue,
    decimal? WarningThreshold,
    decimal? CriticalThreshold
);

public record UpdateMachineCounterValueRequest(
    decimal NewValue
);

public record ResetMachineCounterRequest(
    decimal ResetValue
);

#endregion

#region Dashboard/Summary DTOs

public record MaintenanceDashboardDto(
    int TotalPlans,
    int ActivePlans,
    int DueTodayCount,
    int OverdueCount,
    int OpenRecordsCount,
    int InProgressRecordsCount,
    decimal TotalMaintenanceCostMTD,
    decimal AverageMaintenanceDuration,
    IReadOnlyList<MaintenancePlanListDto> UpcomingMaintenances,
    IReadOnlyList<MaintenanceRecordListDto> RecentRecords,
    IReadOnlyList<MachineCounterListDto> CriticalCounters
);

public record MaintenanceSummaryDto(
    DateTime PeriodStart,
    DateTime PeriodEnd,
    int TotalMaintenanceCount,
    int PreventiveCount,
    int CorrectiveCount,
    int PredictiveCount,
    decimal TotalLaborCost,
    decimal TotalMaterialCost,
    decimal TotalExternalCost,
    decimal TotalCost,
    decimal AverageDurationHours,
    decimal MTBF,  // Mean Time Between Failures
    decimal MTTR   // Mean Time To Repair
);

#endregion
