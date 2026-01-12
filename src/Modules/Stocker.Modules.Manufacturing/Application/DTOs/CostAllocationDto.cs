namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record CostAllocationDto(
    Guid Id,
    string AllocationNumber,
    string CostingMethod,
    Guid? ProductionOrderId,
    string? ProductionOrderNumber,
    Guid? ProductId,
    string? ProductCode,
    string? ProductName,
    Guid? WorkCenterId,
    string? WorkCenterName,
    string? CostCenterId,
    int Year,
    int Month,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal ProductionQuantity,
    decimal GoodQuantity,
    decimal ScrapQuantity,
    decimal ReworkQuantity,
    string UnitOfMeasure,
    decimal DirectMaterialCost,
    decimal DirectLaborCost,
    decimal DirectExpenseCost,
    decimal TotalDirectCost,
    decimal IndirectMaterialCost,
    decimal IndirectLaborCost,
    decimal DepreciationCost,
    decimal EnergyCost,
    decimal MaintenanceCost,
    decimal RentCost,
    decimal InsuranceCost,
    decimal OtherOverheadCost,
    decimal TotalIndirectCost,
    decimal TotalManufacturingCost,
    decimal UnitCost,
    string AllocationBasis,
    decimal AllocationRate,
    decimal AllocationQuantity,
    decimal? StandardCost,
    decimal? CostVariance,
    decimal? VariancePercentage,
    string? VarianceAnalysis,
    string? RawMaterialAccount,
    string? DirectLaborAccount,
    string? OverheadAccount,
    string? ProductionCostAccount,
    bool IsPosted,
    string? JournalEntryId,
    DateTime? PostedAt,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    IReadOnlyList<CostAllocationDetailDto>? Details);

public record CostAllocationListDto(
    Guid Id,
    string AllocationNumber,
    string CostingMethod,
    string? ProductionOrderNumber,
    string? ProductCode,
    int Year,
    int Month,
    decimal TotalManufacturingCost,
    decimal UnitCost,
    decimal? CostVariance,
    string Status);

public record CostAllocationDetailDto(
    Guid Id,
    int SequenceNumber,
    string CostElement,
    string CostType,
    string CostCategory,
    decimal Amount,
    decimal AllocationRate,
    decimal AllocatedAmount,
    string? AccountCode,
    string? CostCenterId,
    string? Description);

public record CreateCostAllocationRequest(
    string CostingMethod,
    Guid? ProductionOrderId,
    Guid? ProductId,
    Guid? WorkCenterId,
    string? CostCenterId,
    int Year,
    int Month,
    string AllocationBasis,
    string? Notes);

public record SetProductionQuantitiesRequest(
    decimal ProductionQuantity,
    decimal GoodQuantity,
    decimal ScrapQuantity,
    decimal ReworkQuantity,
    string UnitOfMeasure);

public record SetDirectCostsRequest(
    decimal MaterialCost,
    decimal LaborCost,
    decimal ExpenseCost);

public record SetIndirectCostsRequest(
    decimal IndirectMaterialCost,
    decimal IndirectLaborCost,
    decimal DepreciationCost,
    decimal EnergyCost,
    decimal MaintenanceCost,
    decimal RentCost,
    decimal InsuranceCost,
    decimal OtherOverheadCost);

public record SetAllocationBasisRequest(
    string Basis,
    decimal Rate,
    decimal Quantity);

public record SetStandardCostRequest(
    decimal StandardCost);

public record Set7AAccountsRequest(
    string RawMaterialAccount,
    string DirectLaborAccount,
    string OverheadAccount,
    string ProductionCostAccount);
