namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record ProductionCostRecordDto(
    int Id,
    string RecordNumber,
    string AccountingMethod,
    int ProductionOrderId,
    string? ProductionOrderNumber,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal Quantity,
    string Unit,
    int Year,
    int Month,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal DirectMaterialCost,
    decimal DirectLaborCost,
    decimal ManufacturingOverhead,
    decimal VariableOverhead,
    decimal FixedOverhead,
    decimal TotalProductionCost,
    decimal MaterialVariance,
    decimal LaborVariance,
    decimal OverheadVariance,
    decimal UnitDirectMaterialCost,
    decimal UnitDirectLaborCost,
    decimal UnitOverheadCost,
    decimal UnitTotalCost,
    decimal StandardCost,
    decimal ActualCost,
    decimal CostVariance,
    decimal VariancePercent,
    string? CostCenterId,
    string? Notes,
    string? CreatedBy,
    bool IsFinalized,
    DateTime? FinalizedDate,
    string? FinalizedBy,
    DateTime CreatedDate,
    IReadOnlyList<ProductionCostAllocationDto>? Allocations,
    IReadOnlyList<CostJournalEntryDto>? JournalEntries);

public record ProductionCostRecordListDto(
    int Id,
    string RecordNumber,
    string AccountingMethod,
    string? ProductionOrderNumber,
    string? ProductCode,
    string? ProductName,
    decimal Quantity,
    int Year,
    int Month,
    decimal TotalProductionCost,
    decimal UnitTotalCost,
    decimal CostVariance,
    decimal VariancePercent,
    bool IsFinalized,
    DateTime CreatedDate);

public record ProductionCostAllocationDto(
    int Id,
    int ProductionCostRecordId,
    string AccountCode,
    string AccountName,
    string Direction,
    decimal Amount,
    string? AllocationBasis,
    decimal AllocationRate,
    string? SourceCostCenter,
    string? TargetCostCenter,
    string? Notes);

public record CostJournalEntryDto(
    int Id,
    int ProductionCostRecordId,
    DateTime EntryDate,
    string AccountCode,
    string AccountName,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    string? DocumentNumber,
    string? DocumentType,
    bool IsPosted,
    DateTime? PostedDate,
    string? PostedBy);

public record CostCenterDto(
    int Id,
    string Code,
    string Name,
    string? Description,
    string Type,
    int? ParentCostCenterId,
    string? ParentCostCenterName,
    string? ResponsiblePerson,
    int? WorkCenterId,
    string? WorkCenterName,
    decimal BudgetAmount,
    decimal ActualAmount,
    decimal VarianceAmount,
    bool IsActive,
    DateTime CreatedDate,
    IReadOnlyList<CostCenterDto>? Children);

public record CostCenterListDto(
    int Id,
    string Code,
    string Name,
    string Type,
    string? ResponsiblePerson,
    decimal BudgetAmount,
    decimal ActualAmount,
    decimal VarianceAmount,
    bool IsActive);

public record StandardCostCardDto(
    int Id,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    int Year,
    int Version,
    bool IsCurrent,
    decimal StandardMaterialCost,
    decimal StandardLaborCost,
    decimal StandardOverheadCost,
    decimal StandardTotalCost,
    decimal StandardMaterialQuantity,
    decimal StandardLaborHours,
    decimal StandardMachineHours,
    decimal MaterialUnitPrice,
    decimal LaborHourlyRate,
    decimal OverheadRate,
    DateTime EffectiveDate,
    DateTime? ExpiryDate,
    string? Notes,
    string? CreatedBy,
    string? ApprovedBy,
    DateTime? ApprovedDate,
    DateTime CreatedDate);

public record StandardCostCardListDto(
    int Id,
    string? ProductCode,
    string? ProductName,
    int Year,
    int Version,
    bool IsCurrent,
    decimal StandardTotalCost,
    DateTime EffectiveDate,
    bool IsApproved);

// Request DTOs
public record CreateProductionCostRecordRequest(
    string AccountingMethod,
    int ProductionOrderId,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal Quantity,
    string Unit,
    int Year,
    int Month,
    string? CostCenterId = null,
    string? Notes = null);

public record SetProductionDirectCostsRequest(
    decimal DirectMaterialCost,
    decimal DirectLaborCost);

public record SetOverheadCostsRequest(
    decimal VariableOverhead,
    decimal FixedOverhead);

public record SetVariancesRequest(
    decimal MaterialVariance,
    decimal LaborVariance,
    decimal OverheadVariance);

public record AddCostAllocationRequest(
    string AccountCode,
    string AccountName,
    string Direction,
    decimal Amount,
    string? AllocationBasis = null,
    decimal AllocationRate = 0,
    string? SourceCostCenter = null,
    string? TargetCostCenter = null,
    string? Notes = null);

public record AddJournalEntryRequest(
    string AccountCode,
    string AccountName,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description = null,
    string? DocumentNumber = null,
    string? DocumentType = null);

public record CreateCostCenterRequest(
    string Code,
    string Name,
    string Type,
    string? Description = null,
    int? ParentCostCenterId = null,
    string? ResponsiblePerson = null,
    int? WorkCenterId = null,
    decimal BudgetAmount = 0);

public record UpdateCostCenterRequest(
    string Name,
    string? Description = null,
    string? ResponsiblePerson = null,
    int? WorkCenterId = null,
    decimal? BudgetAmount = null);

public record CreateStandardCostCardRequest(
    int ProductId,
    string? ProductCode,
    string? ProductName,
    int Year,
    decimal StandardMaterialCost,
    decimal StandardLaborCost,
    decimal StandardOverheadCost,
    decimal StandardMaterialQuantity,
    decimal StandardLaborHours,
    decimal StandardMachineHours,
    decimal MaterialUnitPrice,
    decimal LaborHourlyRate,
    decimal OverheadRate,
    DateTime EffectiveDate,
    DateTime? ExpiryDate = null,
    string? Notes = null);

// Cost Summary DTOs for reporting
public record CostSummaryDto(
    int Year,
    int Month,
    decimal TotalDirectMaterialCost,
    decimal TotalDirectLaborCost,
    decimal TotalManufacturingOverhead,
    decimal TotalProductionCost,
    decimal TotalMaterialVariance,
    decimal TotalLaborVariance,
    decimal TotalOverheadVariance,
    decimal TotalCostVariance,
    int RecordCount);

public record ProductCostAnalysisDto(
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal TotalQuantityProduced,
    decimal TotalProductionCost,
    decimal AverageUnitCost,
    decimal StandardCost,
    decimal TotalCostVariance,
    decimal VariancePercent,
    IReadOnlyList<ProductionCostRecordListDto> CostRecords);

public record CostCenterAnalysisDto(
    string CostCenterId,
    string? CostCenterName,
    decimal TotalBudget,
    decimal TotalActual,
    decimal TotalVariance,
    decimal VariancePercent,
    IReadOnlyList<ProductionCostRecordListDto> CostRecords);
