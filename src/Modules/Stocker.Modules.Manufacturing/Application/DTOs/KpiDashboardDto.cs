namespace Stocker.Modules.Manufacturing.Application.DTOs;

// KPI Definition DTOs
public record KpiDefinitionDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    string Type,
    string Unit,
    string? Formula,
    decimal? TargetValue,
    decimal? MinThreshold,
    decimal? MaxThreshold,
    decimal? TolerancePercent,
    bool IsHigherBetter,
    string DefaultPeriod,
    bool IsActive,
    int DisplayOrder,
    string? Category,
    string? Color,
    string? IconName);

public record KpiDefinitionListDto(
    int Id,
    string Code,
    string Name,
    string Type,
    string Unit,
    decimal? TargetValue,
    bool IsActive,
    string? Category);

public record CreateKpiDefinitionRequest(
    string Code,
    string Name,
    string Type,
    string? Description = null,
    string Unit = "%",
    string? Formula = null,
    decimal? TargetValue = null,
    decimal? MinThreshold = null,
    decimal? MaxThreshold = null,
    decimal? TolerancePercent = null,
    bool IsHigherBetter = true,
    string DefaultPeriod = "Günlük",
    string? Category = null,
    string? Color = null,
    string? IconName = null);

public record UpdateKpiDefinitionRequest(
    string Name,
    string? Description = null,
    decimal? TargetValue = null,
    decimal? MinThreshold = null,
    decimal? MaxThreshold = null,
    decimal? TolerancePercent = null,
    string? Category = null,
    string? Color = null,
    string? IconName = null);

// KPI Value DTOs
public record KpiValueDto(
    int Id,
    int KpiDefinitionId,
    string? KpiCode,
    string? KpiName,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    decimal Value,
    decimal? PreviousValue,
    decimal? ChangePercent,
    string Status,
    decimal? TargetValue,
    decimal? Variance,
    decimal? VariancePercent,
    decimal? Component1,
    string? Component1Name,
    decimal? Component2,
    string? Component2Name,
    decimal? Component3,
    string? Component3Name,
    int? WorkCenterId,
    int? ProductId,
    int? ProductionOrderId,
    string? Notes,
    DateTime CalculatedDate,
    string? CalculatedBy);

public record KpiValueListDto(
    int Id,
    string? KpiCode,
    string? KpiName,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal Value,
    string Status,
    decimal? ChangePercent);

public record CreateKpiValueRequest(
    int KpiDefinitionId,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    decimal Value,
    decimal? Component1 = null,
    string? Component1Name = null,
    decimal? Component2 = null,
    string? Component2Name = null,
    decimal? Component3 = null,
    string? Component3Name = null,
    int? WorkCenterId = null,
    int? ProductId = null,
    int? ProductionOrderId = null,
    string? Notes = null);

// KPI Target DTOs
public record KpiTargetDto(
    int Id,
    int KpiDefinitionId,
    string? KpiCode,
    string? KpiName,
    int Year,
    int? Month,
    int? Quarter,
    decimal TargetValue,
    decimal? StretchTarget,
    decimal? MinimumTarget,
    int? WorkCenterId,
    int? ProductId,
    string? Notes,
    string? SetBy,
    DateTime SetDate,
    bool IsApproved,
    string? ApprovedBy,
    DateTime? ApprovedDate);

public record CreateKpiTargetRequest(
    int KpiDefinitionId,
    int Year,
    decimal TargetValue,
    int? Month = null,
    int? Quarter = null,
    decimal? StretchTarget = null,
    decimal? MinimumTarget = null,
    int? WorkCenterId = null,
    int? ProductId = null,
    string? Notes = null);

// Dashboard Configuration DTOs
public record DashboardConfigurationDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    bool IsDefault,
    bool IsPublic,
    string? CreatedBy,
    int RefreshIntervalSeconds,
    string? LayoutJson,
    bool IsActive,
    IReadOnlyList<DashboardWidgetDto>? Widgets);

public record DashboardConfigurationListDto(
    int Id,
    string Code,
    string Name,
    bool IsDefault,
    bool IsPublic,
    bool IsActive,
    int WidgetCount);

public record CreateDashboardConfigurationRequest(
    string Code,
    string Name,
    string? Description = null,
    bool IsDefault = false,
    bool IsPublic = false,
    int RefreshIntervalSeconds = 60,
    string? LayoutJson = null);

public record UpdateDashboardConfigurationRequest(
    string Name,
    string? Description = null,
    bool? IsDefault = null,
    bool? IsPublic = null,
    int? RefreshIntervalSeconds = null,
    string? LayoutJson = null);

// Dashboard Widget DTOs
public record DashboardWidgetDto(
    int Id,
    int DashboardConfigurationId,
    string Title,
    string Type,
    int? KpiDefinitionId,
    string? KpiCode,
    string? KpiName,
    int PositionX,
    int PositionY,
    int Width,
    int Height,
    string? ConfigurationJson,
    string? DataSourceQuery,
    string? DefaultPeriod,
    int? WorkCenterId,
    int? ProductId,
    bool ShowTrend,
    bool ShowTarget,
    bool IsVisible,
    int DisplayOrder);

public record CreateDashboardWidgetRequest(
    int DashboardConfigurationId,
    string Title,
    string Type,
    int? KpiDefinitionId = null,
    int PositionX = 0,
    int PositionY = 0,
    int Width = 4,
    int Height = 3,
    string? ConfigurationJson = null,
    string? DataSourceQuery = null,
    string? DefaultPeriod = null,
    int? WorkCenterId = null,
    int? ProductId = null,
    bool ShowTrend = false,
    bool ShowTarget = false);

public record UpdateDashboardWidgetRequest(
    string? Title = null,
    int? PositionX = null,
    int? PositionY = null,
    int? Width = null,
    int? Height = null,
    string? ConfigurationJson = null,
    bool? ShowTrend = null,
    bool? ShowTarget = null,
    bool? IsVisible = null);

// OEE Record DTOs
public record OeeRecordDto(
    int Id,
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    DateTime RecordDate,
    DateTime ShiftStart,
    DateTime ShiftEnd,
    string? ShiftName,
    decimal PlannedProductionTime,
    decimal ActualProductionTime,
    decimal DowntimeMinutes,
    decimal SetupMinutes,
    decimal BreakMinutes,
    decimal PlannedQuantity,
    decimal ActualQuantity,
    decimal GoodQuantity,
    decimal DefectQuantity,
    decimal ReworkQuantity,
    decimal ScrapQuantity,
    decimal IdealCycleTime,
    decimal ActualCycleTime,
    decimal Availability,
    decimal Performance,
    decimal Quality,
    decimal OeeValue,
    int? ProductionOrderId,
    string? ProductionOrderNumber,
    int? ProductId,
    string? ProductCode,
    string? Notes,
    string? RecordedBy,
    bool IsValidated,
    string? ValidatedBy,
    DateTime? ValidatedDate);

public record OeeRecordListDto(
    int Id,
    string? WorkCenterCode,
    string? WorkCenterName,
    DateTime RecordDate,
    string? ShiftName,
    decimal Availability,
    decimal Performance,
    decimal Quality,
    decimal OeeValue,
    bool IsValidated);

public record CreateOeeRecordRequest(
    int WorkCenterId,
    DateTime RecordDate,
    DateTime ShiftStart,
    DateTime ShiftEnd,
    string? ShiftName = null,
    decimal PlannedProductionTime = 0,
    decimal ActualProductionTime = 0,
    decimal DowntimeMinutes = 0,
    decimal SetupMinutes = 0,
    decimal BreakMinutes = 0,
    decimal PlannedQuantity = 0,
    decimal ActualQuantity = 0,
    decimal GoodQuantity = 0,
    decimal DefectQuantity = 0,
    decimal ReworkQuantity = 0,
    decimal ScrapQuantity = 0,
    decimal IdealCycleTime = 0,
    decimal ActualCycleTime = 0,
    int? ProductionOrderId = null,
    int? ProductId = null,
    string? Notes = null);

// Production Performance Summary DTOs
public record ProductionPerformanceSummaryDto(
    int Id,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    int? WorkCenterId,
    string? WorkCenterCode,
    int? ProductId,
    string? ProductCode,
    int TotalOrders,
    int CompletedOrders,
    int OnTimeOrders,
    decimal PlannedQuantity,
    decimal ProducedQuantity,
    decimal GoodQuantity,
    decimal DefectQuantity,
    decimal ScrapQuantity,
    decimal PlannedTime,
    decimal ActualTime,
    decimal DowntimeMinutes,
    decimal SetupMinutes,
    decimal ProductionEfficiency,
    decimal QualityRate,
    decimal OnTimeDeliveryRate,
    decimal OeeAverage,
    decimal CapacityUtilization,
    decimal ScrapRate,
    decimal PlannedCost,
    decimal ActualCost,
    decimal CostVariance,
    decimal CostVariancePercent,
    DateTime CalculatedDate,
    string? CalculatedBy);

public record ProductionPerformanceSummaryListDto(
    int Id,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    string? WorkCenterCode,
    decimal ProductionEfficiency,
    decimal QualityRate,
    decimal OeeAverage);

// Dashboard Data DTOs for real-time display
public record DashboardKpiCardDto(
    int KpiDefinitionId,
    string Code,
    string Name,
    string Unit,
    decimal CurrentValue,
    decimal? PreviousValue,
    decimal? ChangePercent,
    string Status,
    decimal? TargetValue,
    decimal? VariancePercent,
    string? Color,
    string? IconName,
    bool IsHigherBetter);

public record DashboardOeeSummaryDto(
    decimal OverallOee,
    decimal Availability,
    decimal Performance,
    decimal Quality,
    int RecordCount,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    IReadOnlyList<OeeByWorkCenterDto> ByWorkCenter);

public record OeeByWorkCenterDto(
    int WorkCenterId,
    string? WorkCenterCode,
    string? WorkCenterName,
    decimal OeeValue,
    decimal Availability,
    decimal Performance,
    decimal Quality);

public record DashboardProductionSummaryDto(
    int TotalOrders,
    int CompletedOrders,
    int InProgressOrders,
    int DelayedOrders,
    decimal ProductionEfficiency,
    decimal QualityRate,
    decimal OnTimeDeliveryRate,
    decimal PlannedQuantity,
    decimal ProducedQuantity,
    DateTime PeriodStart,
    DateTime PeriodEnd);

public record KpiTrendDataDto(
    int KpiDefinitionId,
    string Code,
    string Name,
    IReadOnlyList<KpiTrendPointDto> DataPoints);

public record KpiTrendPointDto(
    DateTime Date,
    decimal Value,
    decimal? TargetValue);

// Report DTOs
public record GenerateReportRequest(
    string ReportType,
    DateTime StartDate,
    DateTime EndDate,
    string Format,
    int? WorkCenterId = null,
    int? ProductId = null,
    string? AdditionalFilters = null);

public record ReportMetadataDto(
    string ReportType,
    string Title,
    DateTime StartDate,
    DateTime EndDate,
    DateTime GeneratedDate,
    string GeneratedBy,
    string Format,
    int? WorkCenterId,
    int? ProductId);
