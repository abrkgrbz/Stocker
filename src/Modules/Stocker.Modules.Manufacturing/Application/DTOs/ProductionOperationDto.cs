namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record ProductionOperationDto(
    int Id,
    int ProductionOrderId,
    string? ProductionOrderNumber,
    int OperationId,
    string? OperationCode,
    string? OperationName,
    int Sequence,
    string Status,
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    int? MachineId,
    string? MachineCode,
    string? MachineName,
    decimal PlannedQuantity,
    decimal CompletedQuantity,
    decimal ScrapQuantity,
    decimal ReworkQuantity,
    decimal PlannedSetupTime,
    decimal PlannedRunTime,
    decimal PlannedQueueTime,
    decimal PlannedMoveTime,
    decimal TotalPlannedTime,
    decimal ActualSetupTime,
    decimal ActualRunTime,
    decimal ActualQueueTime,
    decimal ActualMoveTime,
    decimal TotalActualTime,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    DateTime? ActualStartDate,
    DateTime? ActualEndDate,
    decimal? PlannedLaborCost,
    decimal? PlannedMachineCost,
    decimal? PlannedOverheadCost,
    decimal? ActualLaborCost,
    decimal? ActualMachineCost,
    decimal? ActualOverheadCost,
    string? OperatorId,
    string? OperatorName,
    bool IsSubcontracted,
    bool RequiresInspection,
    bool InspectionCompleted,
    bool InspectionPassed,
    string? Notes);

public record ProductionOperationListDto(
    int Id,
    int Sequence,
    int OperationId,
    string? OperationCode,
    string? OperationName,
    string Status,
    int WorkCenterId,
    string? WorkCenterName,
    int? MachineId,
    string? MachineName,
    decimal PlannedQuantity,
    decimal CompletedQuantity,
    DateTime? PlannedStartDate,
    DateTime? ActualStartDate);

public record StartOperationRequest(
    int? MachineId,
    string? OperatorId,
    DateTime? StartTime);

public record CompleteOperationRequest(
    decimal CompletedQuantity,
    decimal ScrapQuantity,
    decimal ReworkQuantity,
    DateTime? EndTime,
    string? Notes);

public record PauseOperationRequest(
    string Reason);

public record ResumeOperationRequest(
    string? Notes);

public record RecordOperationProgressRequest(
    decimal CompletedQuantity,
    decimal ScrapQuantity,
    string? Notes);
