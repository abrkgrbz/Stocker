namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record MrpPlanDto(
    int Id,
    string PlanNumber,
    string Name,
    string Type,
    string Status,
    DateTime PlanningHorizonStart,
    DateTime PlanningHorizonEnd,
    int PlanningBucketDays,
    string DefaultLotSizingMethod,
    bool IncludeSafetyStock,
    bool ConsiderLeadTimes,
    bool NetChangeOnly,
    decimal? FixedOrderQuantity,
    int? PeriodsOfSupply,
    DateTime? ExecutionStartTime,
    DateTime? ExecutionEndTime,
    int? ProcessedItemCount,
    int? GeneratedRequirementCount,
    int? GeneratedOrderCount,
    string? ExecutedBy,
    string? ApprovedBy,
    DateTime? ApprovalDate,
    string? Notes,
    bool IsActive,
    DateTime CreatedDate,
    IReadOnlyList<MrpRequirementDto>? Requirements,
    IReadOnlyList<PlannedOrderDto>? PlannedOrders,
    IReadOnlyList<MrpExceptionDto>? Exceptions);

public record MrpPlanListDto(
    int Id,
    string PlanNumber,
    string Name,
    string Type,
    string Status,
    DateTime PlanningHorizonStart,
    DateTime PlanningHorizonEnd,
    DateTime? ExecutionStartTime,
    DateTime? ExecutionEndTime,
    int? ProcessedItemCount,
    int? GeneratedOrderCount,
    bool IsActive,
    DateTime CreatedDate);

public record MrpRequirementDto(
    int Id,
    int MrpPlanId,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    DateTime RequirementDate,
    int PeriodNumber,
    decimal GrossRequirement,
    decimal OnHandStock,
    decimal ScheduledReceipts,
    decimal SafetyStock,
    decimal NetRequirement,
    decimal PlannedOrderReceipt,
    decimal PlannedOrderRelease,
    decimal ProjectedOnHand,
    string? DemandSource,
    int? DemandSourceId,
    bool IsProcessed);

public record PlannedOrderDto(
    int Id,
    int MrpPlanId,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    string OrderType,
    string Status,
    decimal Quantity,
    string Unit,
    DateTime PlannedStartDate,
    DateTime PlannedEndDate,
    DateTime? ReleaseDate,
    string LotSizingMethod,
    decimal OriginalQuantity,
    int? ConvertedToOrderId,
    string? ConvertedToOrderType,
    DateTime? ConversionDate,
    string? ConvertedBy,
    string? Notes);

public record PlannedOrderListDto(
    int Id,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    string OrderType,
    string Status,
    decimal Quantity,
    string Unit,
    DateTime PlannedStartDate,
    DateTime PlannedEndDate);

public record MrpExceptionDto(
    int Id,
    int MrpPlanId,
    int? ProductId,
    string? ProductCode,
    string? ProductName,
    string ExceptionType,
    string Severity,
    string Message,
    string? Details,
    DateTime OccurredAt,
    bool IsResolved,
    string? ResolvedBy,
    DateTime? ResolvedAt,
    string? ResolutionNotes);

public record CreateMrpPlanRequest(
    string Name,
    string Type,
    DateTime PlanningHorizonStart,
    DateTime PlanningHorizonEnd,
    int PlanningBucketDays = 7,
    string DefaultLotSizingMethod = "LotForLot",
    bool IncludeSafetyStock = true,
    bool ConsiderLeadTimes = true,
    bool NetChangeOnly = false,
    decimal? FixedOrderQuantity = null,
    int? PeriodsOfSupply = null,
    string? Notes = null);

public record ExecuteMrpPlanRequest(
    bool RegenerateAll = false);

public record ConfirmPlannedOrderRequest(
    string? Notes = null);

public record ReleasePlannedOrderRequest(
    string? Notes = null);

public record ConvertPlannedOrderRequest(
    int ConvertedOrderId,
    string ConvertedOrderType,
    string? Notes = null);

public record ResolveMrpExceptionRequest(
    string? ResolutionNotes);
