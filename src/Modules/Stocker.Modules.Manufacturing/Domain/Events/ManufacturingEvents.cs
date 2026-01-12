using Stocker.SharedKernel.Primitives;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Events;

#region Production Order Events

/// <summary>
/// Üretim emri oluşturulduğunda
/// </summary>
public record ProductionOrderCreated(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal PlannedQuantity,
    DateTime PlannedStartDate,
    DateTime PlannedEndDate,
    string CreatedBy,
    DateTime CreatedAt) : DomainEvent;

/// <summary>
/// Üretim emri güncellendiğinde
/// </summary>
public record ProductionOrderUpdatedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal PlannedQuantity) : DomainEvent;

/// <summary>
/// Üretim emri planlandığında
/// </summary>
public record ProductionOrderPlannedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal PlannedQuantity) : DomainEvent;

/// <summary>
/// Üretim emri onaylandığında
/// </summary>
public record ProductionOrderApproved(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    string ApprovedBy,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Üretim emri serbest bırakıldığında
/// </summary>
public record ProductionOrderReleasedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal PlannedQuantity,
    string ReleasedBy) : DomainEvent;

/// <summary>
/// Üretim emri başladığında
/// </summary>
public record ProductionOrderStartedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal PlannedQuantity) : DomainEvent;

/// <summary>
/// Üretim emri tamamlandığında
/// </summary>
public record ProductionOrderCompletedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal CompletedQuantity,
    decimal ScrapQuantity) : DomainEvent;

/// <summary>
/// Üretim emri kapatıldığında
/// </summary>
public record ProductionOrderClosedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    decimal TotalCost,
    string ClosedBy) : DomainEvent;

/// <summary>
/// Üretim emri iptal edildiğinde
/// </summary>
public record ProductionOrderCancelledDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    string CancelledBy,
    string Reason) : DomainEvent;

/// <summary>
/// Üretim emri bekletmeye alındığında
/// </summary>
public record ProductionOrderHoldDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId,
    string Reason) : DomainEvent;

/// <summary>
/// Üretim emri devam ettirildiğinde
/// </summary>
public record ProductionOrderResumedDomainEvent(
    int ProductionOrderId,
    Guid TenantId,
    string OrderNumber,
    int ProductId) : DomainEvent;

#endregion

#region Operation Events

/// <summary>
/// Operasyon güncellendiğinde
/// </summary>
public record OperationUpdatedDomainEvent(
    int OperationId,
    Guid TenantId,
    string Code,
    string Name,
    int RoutingId,
    int WorkCenterId) : DomainEvent;

/// <summary>
/// Operasyon başladığında
/// </summary>
public record OperationStarted(
    int ProductionOperationId,
    int ProductionOrderId,
    Guid TenantId,
    int OperationNumber,
    int WorkCenterId,
    DateTime StartTime) : DomainEvent;

/// <summary>
/// Operasyon tamamlandığında
/// </summary>
public record OperationCompleted(
    int ProductionOperationId,
    int ProductionOrderId,
    Guid TenantId,
    int OperationNumber,
    decimal CompletedQuantity,
    decimal ScrapQuantity,
    decimal ActualDurationMinutes,
    DateTime EndTime) : DomainEvent;

/// <summary>
/// Operasyon duraklatıldığında
/// </summary>
public record OperationPaused(
    int ProductionOperationId,
    int ProductionOrderId,
    Guid TenantId,
    string Reason,
    DateTime PausedAt) : DomainEvent;

#endregion

#region Production Operation Events

/// <summary>
/// Üretim operasyonu başladığında
/// </summary>
public record ProductionOperationStartedDomainEvent(
    int ProductionOperationId,
    Guid TenantId,
    int ProductionOrderId,
    int OperationId,
    int WorkCenterId,
    int Sequence) : DomainEvent;

/// <summary>
/// Üretim operasyonu duraklatıldığında
/// </summary>
public record ProductionOperationPausedDomainEvent(
    int ProductionOperationId,
    Guid TenantId,
    int ProductionOrderId,
    int OperationId,
    string Reason) : DomainEvent;

/// <summary>
/// Üretim operasyonu tamamlandığında
/// </summary>
public record ProductionOperationCompletedDomainEvent(
    int ProductionOperationId,
    Guid TenantId,
    int ProductionOrderId,
    int OperationId,
    decimal CompletedQuantity,
    decimal ScrapQuantity,
    decimal TotalActualTime) : DomainEvent;

#endregion

#region Material Events

/// <summary>
/// Malzeme tüketildiğinde
/// </summary>
public record MaterialConsumed(
    int MaterialConsumptionId,
    int ProductionOrderId,
    Guid TenantId,
    int ProductId,
    decimal Quantity,
    string? LotNumber,
    int WarehouseId,
    DateTime ConsumedAt) : DomainEvent;

/// <summary>
/// Malzeme iade edildiğinde
/// </summary>
public record MaterialReturnedDomainEvent(
    int MaterialConsumptionId,
    Guid TenantId,
    int ProductionOrderId,
    int ProductId,
    decimal ReturnedQuantity,
    string Reason,
    string ReturnedBy) : DomainEvent;

/// <summary>
/// Üretim girişi yapıldığında
/// </summary>
public record ProductionReceived(
    int ProductionReceiptId,
    int ProductionOrderId,
    Guid TenantId,
    int ProductId,
    decimal Quantity,
    string? LotNumber,
    int WarehouseId,
    DateTime ReceivedAt) : DomainEvent;

#endregion

#region Quality Events

/// <summary>
/// Kalite kontrolü başlatıldığında
/// </summary>
public record QualityInspectionStarted(
    int QualityInspectionId,
    Guid TenantId,
    string InspectionNumber,
    int? ProductionOrderId,
    int ProductId,
    string InspectionType,
    string InspectorId,
    DateTime StartedAt) : DomainEvent;

/// <summary>
/// Kalite kontrolü tamamlandığında
/// </summary>
public record QualityInspectionCompleted(
    int QualityInspectionId,
    Guid TenantId,
    string InspectionNumber,
    string Result,
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Uygunsuzluk tespit edildiğinde
/// </summary>
public record NonConformanceDetected(
    int QualityInspectionId,
    Guid TenantId,
    int? ProductionOrderId,
    int ProductId,
    string Description,
    int CriticalDefects,
    int MajorDefects,
    int MinorDefects,
    DateTime DetectedAt) : DomainEvent;

#endregion

#region Work Center Events

/// <summary>
/// İş merkezi güncellendiğinde
/// </summary>
public record WorkCenterUpdatedDomainEvent(
    int WorkCenterId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// İş merkezi aktifleştirildiğinde
/// </summary>
public record WorkCenterActivatedDomainEvent(
    int WorkCenterId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// İş merkezi pasifleştirildiğinde
/// </summary>
public record WorkCenterDeactivatedDomainEvent(
    int WorkCenterId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

#endregion

#region Machine Events

/// <summary>
/// Makine güncellendiğinde
/// </summary>
public record MachineUpdatedDomainEvent(
    int MachineId,
    Guid TenantId,
    string Code,
    string Name,
    int WorkCenterId) : DomainEvent;

/// <summary>
/// Makine durumu değiştiğinde
/// </summary>
public record MachineStatusChangedDomainEvent(
    int MachineId,
    Guid TenantId,
    string Code,
    string Name,
    MachineStatus OldStatus,
    MachineStatus NewStatus) : DomainEvent;

/// <summary>
/// Makine aktifleştirildiğinde
/// </summary>
public record MachineActivatedDomainEvent(
    int MachineId,
    Guid TenantId,
    string Code,
    string Name,
    int WorkCenterId) : DomainEvent;

/// <summary>
/// Makine pasifleştirildiğinde
/// </summary>
public record MachineDeactivatedDomainEvent(
    int MachineId,
    Guid TenantId,
    string Code,
    string Name,
    int WorkCenterId) : DomainEvent;

/// <summary>
/// Makine arızalandığında
/// </summary>
public record MachineBreakdown(
    int MachineId,
    Guid TenantId,
    string MachineCode,
    string FailureReason,
    int? AffectedProductionOrderId,
    DateTime BreakdownAt) : DomainEvent;

/// <summary>
/// Makine duruşu başladığında
/// </summary>
public record MachineDowntimeStarted(
    int MachineDowntimeId,
    int MachineId,
    Guid TenantId,
    string DowntimeType,
    string DowntimeCategory,
    string Reason,
    DateTime StartTime) : DomainEvent;

/// <summary>
/// Makine duruşu sona erdiğinde
/// </summary>
public record MachineDowntimeEnded(
    int MachineDowntimeId,
    int MachineId,
    Guid TenantId,
    decimal DurationMinutes,
    string? RepairAction,
    decimal RepairCost,
    DateTime EndTime) : DomainEvent;

/// <summary>
/// İş merkezi kapasitesi değiştiğinde
/// </summary>
public record WorkCenterCapacityChanged(
    int WorkCenterId,
    Guid TenantId,
    decimal OldCapacity,
    decimal NewCapacity,
    string Reason,
    DateTime ChangedAt) : DomainEvent;

#endregion

#region BOM Events

/// <summary>
/// BOM güncellendiğinde
/// </summary>
public record BomUpdatedDomainEvent(
    int BomId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId) : DomainEvent;

/// <summary>
/// BOM durumu değiştiğinde
/// </summary>
public record BomStatusChangedDomainEvent(
    int BomId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId,
    BomStatus OldStatus,
    BomStatus NewStatus) : DomainEvent;

/// <summary>
/// BOM onaylandığında
/// </summary>
public record BomApprovedDomainEvent(
    int BomId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId,
    string ApprovedBy) : DomainEvent;

/// <summary>
/// BOM aktifleştirildiğinde
/// </summary>
public record BomActivatedDomainEvent(
    int BomId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId) : DomainEvent;

/// <summary>
/// BOM pasifleştirildiğinde
/// </summary>
public record BomDeactivatedDomainEvent(
    int BomId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId) : DomainEvent;

#endregion

#region Routing Events

/// <summary>
/// Rota güncellendiğinde
/// </summary>
public record RoutingUpdatedDomainEvent(
    int RoutingId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId) : DomainEvent;

/// <summary>
/// Rota durumu değiştiğinde
/// </summary>
public record RoutingStatusChangedDomainEvent(
    int RoutingId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId,
    RoutingStatus OldStatus,
    RoutingStatus NewStatus) : DomainEvent;

/// <summary>
/// Rota onaylandığında
/// </summary>
public record RoutingApprovedDomainEvent(
    int RoutingId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId,
    string ApprovedBy) : DomainEvent;

/// <summary>
/// Rota aktifleştirildiğinde
/// </summary>
public record RoutingActivatedDomainEvent(
    int RoutingId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId) : DomainEvent;

/// <summary>
/// Rota pasifleştirildiğinde
/// </summary>
public record RoutingDeactivatedDomainEvent(
    int RoutingId,
    Guid TenantId,
    string Code,
    string Name,
    int ProductId) : DomainEvent;

#endregion

#region Cost Events

/// <summary>
/// Maliyet dağıtımı tamamlandığında
/// </summary>
public record CostAllocationCompleted(
    int CostAllocationId,
    Guid TenantId,
    int? ProductionOrderId,
    string CostingMethod,
    decimal TotalCost,
    decimal UnitCost,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Maliyet sapması tespit edildiğinde
/// </summary>
public record CostVarianceDetected(
    int CostAllocationId,
    Guid TenantId,
    int? ProductionOrderId,
    decimal StandardCost,
    decimal ActualCost,
    decimal VarianceAmount,
    decimal VariancePercentage,
    DateTime DetectedAt) : DomainEvent;

#endregion
