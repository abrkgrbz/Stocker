namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record MasterProductionScheduleDto(
    int Id,
    string ScheduleNumber,
    string Name,
    string Status,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    int FrozenPeriodDays,
    int SlushyPeriodDays,
    int FreePeriodDays,
    string? CreatedBy,
    string? ApprovedBy,
    DateTime? ApprovalDate,
    string? Notes,
    bool IsActive,
    DateTime CreatedDate,
    IReadOnlyList<MpsLineDto>? Lines);

public record MasterProductionScheduleListDto(
    int Id,
    string ScheduleNumber,
    string Name,
    string Status,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    int TotalLines,
    bool IsActive,
    DateTime CreatedDate);

public record MpsLineDto(
    int Id,
    int MpsId,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    DateTime PeriodDate,
    int PeriodNumber,
    decimal ForecastQuantity,
    decimal CustomerOrderQuantity,
    decimal DependentDemand,
    decimal PlannedProductionQuantity,
    decimal ProjectedAvailableBalance,
    decimal AvailableToPromise,
    decimal BeginningInventory,
    decimal SafetyStock,
    decimal ActualProductionQuantity,
    decimal ActualSalesQuantity,
    string? Notes);

public record MpsLineListDto(
    int Id,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    DateTime PeriodDate,
    decimal ForecastQuantity,
    decimal CustomerOrderQuantity,
    decimal PlannedProductionQuantity,
    decimal ProjectedAvailableBalance,
    decimal AvailableToPromise);

public record CreateMasterProductionScheduleRequest(
    string Name,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType = "Haftalık",
    int FrozenPeriodDays = 7,
    int SlushyPeriodDays = 14,
    int FreePeriodDays = 30,
    string? Notes = null);

public record UpdateMasterProductionScheduleRequest(
    string Name,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    string PeriodType,
    int FrozenPeriodDays,
    int SlushyPeriodDays,
    int FreePeriodDays,
    string? Notes = null);

public record AddMpsLineRequest(
    int ProductId,
    DateTime PeriodDate,
    decimal ForecastQuantity,
    decimal CustomerOrderQuantity = 0,
    decimal PlannedProductionQuantity = 0,
    decimal BeginningInventory = 0,
    decimal SafetyStock = 0,
    string? Notes = null);

public record UpdateMpsLineRequest(
    decimal ForecastQuantity,
    decimal CustomerOrderQuantity,
    decimal PlannedProductionQuantity,
    decimal BeginningInventory,
    decimal SafetyStock,
    string? Notes = null);

public record CalculatePabAtpRequest(
    decimal BeginningInventory,
    decimal SafetyStock);

public record AtpQueryRequest(
    int ProductId,
    DateTime Date);

public record AtpQueryResponse(
    int ProductId,
    string? ProductCode,
    string? ProductName,
    DateTime Date,
    decimal AvailableToPromise,
    string FenceType);
