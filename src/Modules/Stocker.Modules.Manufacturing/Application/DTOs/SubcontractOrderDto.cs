namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record SubcontractOrderDto(
    int Id,
    string OrderNumber,
    int SubcontractorId,
    string SubcontractorName,
    int? ProductionOrderId,
    string? ProductionOrderNumber,
    int? OperationId,
    string? OperationCode,
    string Status,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal OrderQuantity,
    string Unit,
    DateTime OrderDate,
    DateTime ExpectedDeliveryDate,
    DateTime? ActualDeliveryDate,
    int LeadTimeDays,
    decimal UnitCost,
    decimal TotalCost,
    decimal? ActualCost,
    string? CostCenterId,
    decimal ShippedQuantity,
    decimal ReceivedQuantity,
    decimal RejectedQuantity,
    decimal ScrapQuantity,
    bool RequiresInspection,
    int? QualityPlanId,
    string? Notes,
    string? CreatedBy,
    string? ApprovedBy,
    DateTime? ApprovedDate,
    bool IsActive,
    DateTime CreatedDate,
    decimal CompletionPercent,
    IReadOnlyList<SubcontractShipmentDto>? Shipments,
    IReadOnlyList<SubcontractMaterialDto>? Materials);

public record SubcontractOrderListDto(
    int Id,
    string OrderNumber,
    int SubcontractorId,
    string SubcontractorName,
    string Status,
    string? ProductCode,
    string? ProductName,
    decimal OrderQuantity,
    string Unit,
    DateTime ExpectedDeliveryDate,
    decimal ShippedQuantity,
    decimal ReceivedQuantity,
    decimal CompletionPercent,
    bool IsOverdue,
    DateTime CreatedDate);

public record SubcontractShipmentDto(
    int Id,
    int SubcontractOrderId,
    string Type,
    decimal Quantity,
    decimal RejectedQuantity,
    DateTime ShipmentDate,
    string? BatchNumber,
    string? LotNumber,
    string? InvoiceNumber,
    string? DeliveryNoteNumber,
    string? Notes);

public record SubcontractMaterialDto(
    int Id,
    int SubcontractOrderId,
    int MaterialId,
    string? MaterialCode,
    string? MaterialName,
    decimal RequiredQuantity,
    decimal ShippedQuantity,
    decimal ReturnedQuantity,
    decimal ConsumedQuantity,
    string Unit);

// Request DTOs
public record CreateSubcontractOrderRequest(
    int SubcontractorId,
    string SubcontractorName,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal OrderQuantity,
    string Unit,
    DateTime ExpectedDeliveryDate,
    decimal UnitCost,
    int? ProductionOrderId = null,
    int? OperationId = null,
    string? CostCenterId = null,
    bool RequiresInspection = true,
    int? QualityPlanId = null,
    string? Notes = null);

public record ShipMaterialRequest(
    decimal Quantity,
    string? BatchNumber = null,
    string? Notes = null);

public record ReceiveProductRequest(
    decimal Quantity,
    decimal RejectedQuantity = 0,
    string? BatchNumber = null,
    string? InvoiceNumber = null,
    string? DeliveryNoteNumber = null,
    string? Notes = null);

public record RecordScrapRequest(
    decimal Quantity,
    string Reason);

public record AddSubcontractMaterialRequest(
    int MaterialId,
    string? MaterialCode,
    string? MaterialName,
    decimal RequiredQuantity,
    string Unit);

public record UpdateMaterialShipmentRequest(
    decimal Quantity);
