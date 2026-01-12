namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record ProductionReceiptDto(
    Guid Id,
    string ReceiptNumber,
    Guid ProductionOrderId,
    string ProductionOrderNumber,
    Guid ProductionOperationId,
    int OperationNumber,
    Guid ProductId,
    string ProductCode,
    string ProductName,
    Guid? WarehouseId,
    string? WarehouseName,
    Guid? LocationId,
    string? LocationName,
    decimal PlannedQuantity,
    decimal ReceivedQuantity,
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    decimal ScrapQuantity,
    string UnitOfMeasure,
    string? LotNumber,
    string? SerialNumber,
    DateTime? ExpiryDate,
    DateTime? ProductionDate,
    bool RequiresQualityCheck,
    bool QualityCheckCompleted,
    Guid? QualityInspectionId,
    string QualityStatus,
    decimal UnitCost,
    decimal TotalCost,
    decimal MaterialCost,
    decimal LaborCost,
    decimal OverheadCost,
    DateTime ReceiptDate,
    DateTime? PostingDate,
    string? TraceabilityCode,
    string Status,
    Guid? ApprovedBy,
    DateTime? ApprovedAt,
    string? Notes,
    DateTime CreatedAt);

public record ProductionReceiptListDto(
    Guid Id,
    string ReceiptNumber,
    string ProductionOrderNumber,
    string ProductCode,
    string ProductName,
    decimal ReceivedQuantity,
    decimal AcceptedQuantity,
    string? LotNumber,
    string QualityStatus,
    DateTime ReceiptDate,
    string Status);

public record CreateProductionReceiptRequest(
    Guid ProductionOrderId,
    Guid ProductionOperationId,
    Guid ProductId,
    decimal ReceivedQuantity,
    string UnitOfMeasure,
    Guid? WarehouseId,
    Guid? LocationId,
    string? LotNumber,
    string? SerialNumber,
    DateTime? ExpiryDate,
    bool RequiresQualityCheck,
    string? Notes);

public record SetReceiptQuantitiesRequest(
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    decimal ScrapQuantity);

public record SetReceiptCostsRequest(
    decimal MaterialCost,
    decimal LaborCost,
    decimal OverheadCost);

public record CompleteQualityCheckRequest(
    Guid QualityInspectionId,
    string QualityStatus,
    decimal? AcceptedQuantity,
    decimal? RejectedQuantity);
