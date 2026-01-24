namespace Stocker.Modules.Sales.Application.DTOs;

public record SalesTargetDto(
    Guid Id,
    string TargetCode,
    string Name,
    string? Description,
    string TargetType,
    string PeriodType,
    int Year,
    Guid? SalesRepresentativeId,
    string? SalesRepresentativeName,
    Guid? SalesTeamId,
    string? SalesTeamName,
    Guid? SalesTerritoryId,
    string? SalesTerritoryName,
    decimal TotalTargetAmount,
    decimal TotalActualAmount,
    string Currency,
    string MetricType,
    decimal? TargetQuantity,
    decimal? ActualQuantity,
    decimal MinimumAchievementPercentage,
    string Status,
    decimal AchievementPercentage,
    string Forecast,
    Guid? ParentTargetId,
    string? Notes,
    List<SalesTargetPeriodDto> Periods,
    List<SalesTargetProductDto> ProductTargets);

public record SalesTargetListDto(
    Guid Id,
    string TargetCode,
    string Name,
    string TargetType,
    string PeriodType,
    int Year,
    string? SalesRepresentativeName,
    string? SalesTeamName,
    decimal TotalTargetAmount,
    decimal TotalActualAmount,
    string Currency,
    string Status,
    decimal AchievementPercentage,
    string Forecast);

public record SalesTargetPeriodDto(
    Guid Id,
    int PeriodNumber,
    DateTime StartDate,
    DateTime EndDate,
    decimal TargetAmount,
    decimal ActualAmount,
    string Currency,
    decimal? TargetQuantity,
    decimal? ActualQuantity,
    decimal AchievementPercentage);

public record SalesTargetProductDto(
    Guid Id,
    Guid ProductId,
    string ProductCode,
    string ProductName,
    decimal TargetAmount,
    decimal ActualAmount,
    string Currency,
    decimal? TargetQuantity,
    decimal? ActualQuantity,
    decimal Weight,
    decimal AchievementPercentage);

public record CreateSalesTargetDto(
    string Name,
    string TargetType,
    string PeriodType,
    int Year,
    decimal TotalTargetAmount,
    string Currency,
    string MetricType = "Revenue",
    decimal MinimumAchievementPercentage = 70,
    string? Description = null,
    bool GeneratePeriods = true);

public record AssignSalesTargetDto(
    Guid AssigneeId,
    string AssigneeName);

public record AddSalesTargetPeriodDto(
    int PeriodNumber,
    DateTime StartDate,
    DateTime EndDate,
    decimal TargetAmount,
    decimal? TargetQuantity = null);

public record AddSalesTargetProductDto(
    Guid ProductId,
    string ProductCode,
    string ProductName,
    decimal TargetAmount,
    decimal? TargetQuantity = null,
    decimal Weight = 1);

public record RecordAchievementDto(
    DateTime AchievementDate,
    decimal Amount,
    decimal? Quantity = null,
    Guid? SalesOrderId = null,
    Guid? InvoiceId = null,
    Guid? ProductId = null,
    Guid? CustomerId = null);
