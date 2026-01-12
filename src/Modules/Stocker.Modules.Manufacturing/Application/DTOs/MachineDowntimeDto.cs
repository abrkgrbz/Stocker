namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record MachineDowntimeDto(
    Guid Id,
    string DowntimeNumber,
    Guid MachineId,
    string MachineCode,
    string MachineName,
    Guid? WorkCenterId,
    string? WorkCenterName,
    string DowntimeType,
    string DowntimeCategory,
    string DowntimeReason,
    string? DowntimeCode,
    DateTime StartTime,
    DateTime? EndTime,
    decimal DurationMinutes,
    decimal? EstimatedDurationMinutes,
    Guid? AffectedProductionOrderId,
    string? AffectedProductionOrderNumber,
    Guid? AffectedOperationId,
    decimal LostProductionQuantity,
    decimal LostProductionValue,
    string? FailureMode,
    string? FailureCause,
    string? FailureEffect,
    int? SeverityLevel,
    string? RepairAction,
    string? PreventiveAction,
    decimal RepairCost,
    string? SpareParts,
    Guid? ReportedBy,
    DateTime? ReportedAt,
    Guid? AssignedTo,
    string? AssignedToName,
    Guid? ResolvedBy,
    DateTime? ResolvedAt,
    string? MaintenanceWorkOrderId,
    bool AffectsOEE,
    string OEECategory,
    string Status,
    string? Notes,
    DateTime CreatedAt);

public record MachineDowntimeListDto(
    Guid Id,
    string DowntimeNumber,
    string MachineCode,
    string MachineName,
    string DowntimeType,
    string DowntimeCategory,
    string DowntimeReason,
    DateTime StartTime,
    DateTime? EndTime,
    decimal DurationMinutes,
    string Status);

public record CreateMachineDowntimeRequest(
    Guid MachineId,
    Guid? WorkCenterId,
    string DowntimeType,
    string DowntimeCategory,
    string DowntimeReason,
    string? DowntimeCode,
    DateTime StartTime,
    decimal? EstimatedDurationMinutes,
    Guid? AffectedProductionOrderId,
    Guid? AffectedOperationId,
    string? Notes);

public record RecordFailureDetailsRequest(
    string FailureMode,
    string FailureCause,
    string FailureEffect,
    int SeverityLevel);

public record AssignTechnicianRequest(
    Guid TechnicianId);

public record RecordRepairRequest(
    string RepairAction,
    decimal RepairCost,
    string? SpareParts,
    string? PreventiveAction);

public record CalculateLossRequest(
    decimal LostQuantity,
    decimal UnitValue);
