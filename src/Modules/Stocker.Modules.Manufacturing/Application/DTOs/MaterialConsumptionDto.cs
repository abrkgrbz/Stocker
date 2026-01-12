namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record MaterialConsumptionDto(
    Guid Id,
    string ConsumptionNumber,
    Guid ProductionOrderId,
    string ProductionOrderNumber,
    Guid? ProductionOperationId,
    int? OperationNumber,
    Guid ProductId,
    string ProductCode,
    string ProductName,
    Guid? ProductionOrderLineId,
    decimal PlannedQuantity,
    decimal ConsumedQuantity,
    decimal VarianceQuantity,
    string UnitOfMeasure,
    string? LotNumber,
    string? SerialNumber,
    Guid? WarehouseId,
    string? WarehouseName,
    Guid? LocationId,
    string? LocationName,
    decimal UnitCost,
    decimal TotalCost,
    string ConsumptionType,
    string ConsumptionMethod,
    DateTime ConsumptionDate,
    bool IsPosted,
    DateTime? PostedAt,
    string Status,
    string? Notes,
    Guid CreatedBy,
    DateTime CreatedAt);

public record MaterialConsumptionListDto(
    Guid Id,
    string ConsumptionNumber,
    string ProductionOrderNumber,
    string ProductCode,
    string ProductName,
    decimal ConsumedQuantity,
    string? LotNumber,
    DateTime ConsumptionDate,
    string Status);

public record CreateMaterialConsumptionRequest(
    Guid ProductionOrderId,
    Guid? ProductionOperationId,
    Guid ProductId,
    Guid? ProductionOrderLineId,
    decimal ConsumedQuantity,
    string UnitOfMeasure,
    string? LotNumber,
    string? SerialNumber,
    Guid? WarehouseId,
    Guid? LocationId,
    string ConsumptionType,
    string ConsumptionMethod,
    DateTime? ConsumptionDate,
    string? Notes);

public record BackflushMaterialsRequest(
    Guid ProductionOrderId,
    Guid ProductionOperationId,
    decimal ProducedQuantity,
    Guid WarehouseId,
    string? Notes);

public record ReverseMaterialConsumptionRequest(
    string Reason);
