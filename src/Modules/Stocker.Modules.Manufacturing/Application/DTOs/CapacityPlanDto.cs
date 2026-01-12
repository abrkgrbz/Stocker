namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record CapacityPlanDto(
    int Id,
    string PlanNumber,
    string Name,
    int? MrpPlanId,
    DateTime PlanningHorizonStart,
    DateTime PlanningHorizonEnd,
    int PlanningBucketDays,
    bool IsFiniteCapacity,
    bool IncludeSetupTime,
    bool IncludeQueueTime,
    bool IncludeMoveTime,
    decimal OverloadThreshold,
    decimal BottleneckThreshold,
    string Status,
    DateTime? ExecutionStartTime,
    DateTime? ExecutionEndTime,
    string? ExecutedBy,
    int WorkCenterCount,
    int OverloadedPeriodCount,
    int BottleneckCount,
    decimal AverageUtilization,
    string? Notes,
    bool IsActive,
    DateTime CreatedDate,
    IReadOnlyList<CapacityRequirementDto>? Requirements,
    IReadOnlyList<CapacityExceptionDto>? Exceptions);

public record CapacityPlanListDto(
    int Id,
    string PlanNumber,
    string Name,
    int? MrpPlanId,
    string Status,
    DateTime PlanningHorizonStart,
    DateTime PlanningHorizonEnd,
    DateTime? ExecutionStartTime,
    DateTime? ExecutionEndTime,
    int WorkCenterCount,
    int OverloadedPeriodCount,
    decimal AverageUtilization,
    bool IsActive,
    DateTime CreatedDate);

public record CapacityRequirementDto(
    int Id,
    int CapacityPlanId,
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    DateTime PeriodDate,
    int PeriodNumber,
    decimal AvailableCapacity,
    decimal RequiredCapacity,
    decimal SetupTime,
    decimal RunTime,
    decimal QueueTime,
    decimal MoveTime,
    decimal LoadPercent,
    decimal OverUnderCapacity,
    string Status,
    decimal ShiftedHours,
    DateTime? ShiftedToDate,
    string? Notes,
    IReadOnlyList<CapacityLoadDetailDto>? LoadDetails);

public record CapacityRequirementSummaryDto(
    int WorkCenterId,
    string WorkCenterCode,
    string WorkCenterName,
    DateTime PeriodDate,
    decimal AvailableCapacity,
    decimal RequiredCapacity,
    decimal LoadPercent,
    string Status);

public record CapacityLoadDetailDto(
    int Id,
    int CapacityRequirementId,
    int? ProductionOrderId,
    string? ProductionOrderNumber,
    int? PlannedOrderId,
    int? OperationId,
    string? OperationCode,
    int? ProductId,
    string? ProductCode,
    decimal SetupHours,
    decimal RunHours,
    decimal QueueHours,
    decimal MoveHours,
    decimal TotalHours,
    decimal Quantity,
    DateTime PlannedStartDate,
    DateTime PlannedEndDate,
    string LoadType);

public record CapacityExceptionDto(
    int Id,
    int CapacityPlanId,
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    DateTime PeriodDate,
    string Type,
    string Severity,
    string Message,
    decimal? RequiredCapacity,
    decimal? AvailableCapacity,
    decimal? ShortageHours,
    bool IsResolved,
    string? ResolvedBy,
    DateTime? ResolvedDate,
    string? ResolutionNotes);

public record WorkCenterCapacityOverviewDto(
    int WorkCenterId,
    string WorkCenterCode,
    string WorkCenterName,
    decimal TotalAvailableCapacity,
    decimal TotalRequiredCapacity,
    decimal AverageLoadPercent,
    int OverloadedPeriods,
    int BottleneckPeriods,
    bool IsBottleneck,
    IReadOnlyList<CapacityRequirementSummaryDto> PeriodDetails);

// Request DTOs
public record CreateCapacityPlanRequest(
    string Name,
    int? MrpPlanId,
    DateTime PlanningHorizonStart,
    DateTime PlanningHorizonEnd,
    int PlanningBucketDays = 1,
    bool IsFiniteCapacity = false,
    bool IncludeSetupTime = true,
    bool IncludeQueueTime = true,
    bool IncludeMoveTime = true,
    decimal OverloadThreshold = 100,
    decimal BottleneckThreshold = 90,
    string? Notes = null);

public record UpdateCapacityPlanRequest(
    string Name,
    int PlanningBucketDays,
    bool IsFiniteCapacity,
    bool IncludeSetupTime,
    bool IncludeQueueTime,
    bool IncludeMoveTime,
    decimal OverloadThreshold,
    decimal BottleneckThreshold,
    string? Notes);

public record ExecuteCapacityPlanRequest(
    bool RegenerateAll = false,
    int[]? WorkCenterIds = null);

public record ResolveCapacityExceptionRequest(
    string? ResolutionNotes);

// Capacity Load Analysis Request
public record CapacityLoadAnalysisRequest(
    int[] WorkCenterIds,
    DateTime StartDate,
    DateTime EndDate,
    bool IncludeProductionOrders = true,
    bool IncludePlannedOrders = true);

public record CapacityLoadAnalysisDto(
    DateTime AnalysisDate,
    DateTime StartDate,
    DateTime EndDate,
    int WorkCenterCount,
    int TotalPeriods,
    int OverloadedPeriods,
    int BottleneckWorkCenters,
    decimal AverageUtilization,
    IReadOnlyList<WorkCenterCapacityOverviewDto> WorkCenterDetails);
