using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Application.DTOs;

#region Material Reservation DTOs

public record MaterialReservationDto(
    int Id,
    string ReservationNumber,
    MaterialReservationStatus Status,
    string StatusText,
    MaterialReservationType Type,
    string TypeText,
    // Referanslar
    int? ProductionOrderId,
    string? ProductionOrderNumber,
    int? ProductionOrderLineId,
    int? SalesOrderId,
    string? SalesOrderNumber,
    int? ProjectId,
    string? ProjectCode,
    int? SubcontractOrderId,
    string? SubcontractOrderNumber,
    int? MrpPlanId,
    string? ReferenceType,
    int? ReferenceId,
    // Malzeme
    int ProductId,
    string? ProductCode,
    string? ProductName,
    int? BomLineId,
    // Miktar
    decimal RequiredQuantity,
    decimal AllocatedQuantity,
    decimal IssuedQuantity,
    decimal ReturnedQuantity,
    decimal RemainingToAllocate,
    decimal RemainingToIssue,
    decimal NetRequirement,
    string Unit,
    // Tarihler
    DateTime RequiredDate,
    DateTime? AllocationDate,
    DateTime? ExpiryDate,
    // Depo
    int? WarehouseId,
    string? WarehouseCode,
    int? LocationId,
    string? LocationCode,
    // Lot/Seri
    string? LotNumber,
    string? SerialNumber,
    bool IsLotControlled,
    bool IsSerialControlled,
    // Öncelik
    int Priority,
    bool IsUrgent,
    bool AutoAllocate,
    // Talep
    string? RequestedBy,
    int? RequestedByUserId,
    DateTime RequestedDate,
    // Onay
    bool RequiresApproval,
    string? ApprovedBy,
    DateTime? ApprovedDate,
    // Meta
    string? Notes,
    bool IsActive,
    IReadOnlyList<MaterialReservationAllocationDto>? Allocations,
    IReadOnlyList<MaterialReservationIssueDto>? Issues);

public record MaterialReservationListDto(
    int Id,
    string ReservationNumber,
    MaterialReservationStatus Status,
    string StatusText,
    MaterialReservationType Type,
    string TypeText,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal RequiredQuantity,
    decimal AllocatedQuantity,
    decimal IssuedQuantity,
    string Unit,
    DateTime RequiredDate,
    int? WarehouseId,
    string? WarehouseCode,
    string? LotNumber,
    int Priority,
    bool IsUrgent,
    string? RequestedBy,
    DateTime RequestedDate,
    bool RequiresApproval,
    bool IsApproved,
    bool IsActive);

public record MaterialReservationAllocationDto(
    int Id,
    int MaterialReservationId,
    decimal Quantity,
    int WarehouseId,
    string? WarehouseCode,
    int? LocationId,
    string? LocationCode,
    string? LotNumber,
    string? SerialNumber,
    int? StockId,
    DateTime AllocationDate,
    string AllocatedBy,
    bool IsCancelled,
    string? CancelReason,
    string? CancelledBy,
    DateTime? CancelledDate,
    string? Notes);

public record MaterialReservationIssueDto(
    int Id,
    int MaterialReservationId,
    decimal Quantity,
    int WarehouseId,
    string? WarehouseCode,
    int? LocationId,
    string? LocationCode,
    string? LotNumber,
    string? SerialNumber,
    int? StockMovementId,
    DateTime IssueDate,
    string IssuedBy,
    decimal ReturnedQuantity,
    string? ReturnReason,
    string? ReturnedBy,
    DateTime? ReturnDate,
    decimal NetQuantity,
    string? Notes);

#endregion

#region Request DTOs

public record CreateMaterialReservationRequest(
    int ProductId,
    decimal RequiredQuantity,
    string Unit,
    DateTime RequiredDate,
    MaterialReservationType Type,
    string? ProductCode = null,
    string? ProductName = null,
    int? ProductionOrderId = null,
    int? ProductionOrderLineId = null,
    int? BomLineId = null,
    int? SalesOrderId = null,
    int? ProjectId = null,
    int? SubcontractOrderId = null,
    int? MrpPlanId = null,
    int? WarehouseId = null,
    string? WarehouseCode = null,
    int? LocationId = null,
    string? LocationCode = null,
    string? LotNumber = null,
    string? SerialNumber = null,
    bool IsLotControlled = false,
    bool IsSerialControlled = false,
    int Priority = 5,
    bool IsUrgent = false,
    bool AutoAllocate = false,
    bool RequiresApproval = false,
    DateTime? ExpiryDate = null,
    string? Notes = null);

public record UpdateMaterialReservationRequest(
    decimal RequiredQuantity,
    DateTime RequiredDate,
    int? WarehouseId = null,
    string? WarehouseCode = null,
    int? LocationId = null,
    string? LocationCode = null,
    int Priority = 5,
    bool IsUrgent = false,
    DateTime? ExpiryDate = null,
    string? Notes = null);

public record AllocateMaterialRequest(
    decimal Quantity,
    int WarehouseId,
    string? WarehouseCode = null,
    int? LocationId = null,
    string? LocationCode = null,
    string? LotNumber = null,
    string? SerialNumber = null,
    int? StockId = null,
    string? Notes = null);

public record IssueMaterialRequest(
    decimal Quantity,
    int WarehouseId,
    int? StockMovementId = null,
    string? LotNumber = null,
    string? SerialNumber = null,
    string? Notes = null);

public record ReturnMaterialRequest(
    decimal Quantity,
    string Reason);

public record CancelAllocationRequest(
    int AllocationId,
    string Reason);

public record ApproveMaterialReservationRequest(
    string ApprovedBy);

public record CancelMaterialReservationRequest(
    string Reason);

#endregion

#region Summary DTOs

public record MaterialReservationSummaryDto(
    int TotalReservations,
    int ActiveReservations,
    int PartiallyAllocated,
    int FullyAllocated,
    int Completed,
    int Cancelled,
    int Expired,
    int UrgentReservations,
    int PendingApproval,
    decimal TotalRequiredQuantity,
    decimal TotalAllocatedQuantity,
    decimal TotalIssuedQuantity,
    decimal AllocationRate,
    decimal FulfillmentRate);

public record ProductReservationSummaryDto(
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal TotalReserved,
    decimal TotalAllocated,
    decimal TotalIssued,
    decimal AvailableForReservation,
    int ActiveReservationCount);

public record WarehouseReservationSummaryDto(
    int WarehouseId,
    string? WarehouseCode,
    int TotalReservations,
    decimal TotalAllocatedQuantity,
    decimal TotalIssuedQuantity,
    int PendingAllocations);

#endregion
