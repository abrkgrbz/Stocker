using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Application.DTOs;

#region NCR DTOs

public record NonConformanceReportDto(
    int Id,
    string NcrNumber,
    NcrStatus Status,
    NcrSource Source,
    NcrSeverity Severity,
    // İlişkili kayıtlar
    int? ProductionOrderId,
    string? ProductionOrderNumber,
    int? ProductionOperationId,
    int? QualityInspectionId,
    int? PurchaseOrderId,
    int? SalesOrderId,
    // Ürün bilgileri
    int ProductId,
    string? ProductCode,
    string? ProductName,
    string? LotNumber,
    string? SerialNumber,
    decimal AffectedQuantity,
    string Unit,
    // Lokasyon
    int? WorkCenterId,
    string? WorkCenterName,
    int? WarehouseId,
    string? DetectionLocation,
    // Uygunsuzluk detayları
    string Title,
    string Description,
    string? DefectType,
    string? DefectCode,
    string? SpecificationReference,
    string? ActualValue,
    string? ExpectedValue,
    // Tespit
    DateTime DetectionDate,
    string? DetectedBy,
    int? DetectedByUserId,
    // Soruşturma
    string? InvestigationNotes,
    DateTime? InvestigationStartDate,
    DateTime? InvestigationEndDate,
    string? InvestigatedBy,
    // Kök neden
    RootCauseCategory? RootCauseCategory,
    string? RootCauseDescription,
    string? FiveWhyAnalysis,
    string? IshikawaDiagram,
    // Karar
    NcrDisposition? Disposition,
    string? DispositionReason,
    string? DispositionApprovedBy,
    DateTime? DispositionDate,
    // Müşteri/Tedarikçi
    int? CustomerId,
    string? CustomerName,
    int? SupplierId,
    string? SupplierName,
    bool CustomerNotificationRequired,
    bool CustomerNotified,
    DateTime? CustomerNotificationDate,
    // Maliyet
    decimal? EstimatedCost,
    decimal? ActualCost,
    string? CostBreakdown,
    // Kapatma
    DateTime? ClosedDate,
    string? ClosedBy,
    string? ClosureNotes,
    // Meta
    string? Notes,
    string? Attachments,
    string? CreatedBy,
    DateTime CreatedDate,
    bool IsActive,
    int AgeDays,
    IReadOnlyList<NcrContainmentActionDto>? ContainmentActions,
    IReadOnlyList<CorrectivePreventiveActionListDto>? CapaActions);

public record NonConformanceReportListDto(
    int Id,
    string NcrNumber,
    NcrStatus Status,
    string StatusText,
    NcrSource Source,
    string SourceText,
    NcrSeverity Severity,
    string SeverityText,
    int ProductId,
    string? ProductCode,
    string? ProductName,
    decimal AffectedQuantity,
    string Unit,
    string Title,
    DateTime DetectionDate,
    string? DetectedBy,
    NcrDisposition? Disposition,
    string? DispositionText,
    int? CustomerId,
    string? CustomerName,
    int? SupplierId,
    string? SupplierName,
    decimal? EstimatedCost,
    DateTime? ClosedDate,
    int AgeDays,
    int ContainmentActionCount,
    int CapaActionCount,
    bool IsActive);

public record NcrContainmentActionDto(
    int Id,
    int NonConformanceReportId,
    string Action,
    string ResponsiblePerson,
    DateTime DueDate,
    DateTime? CompletedDate,
    bool IsCompleted,
    string? Result,
    string? Notes);

#endregion

#region CAPA DTOs

public record CorrectivePreventiveActionDto(
    int Id,
    string CapaNumber,
    int? NonConformanceReportId,
    string? NcrNumber,
    CapaType Type,
    string TypeText,
    CapaStatus Status,
    string StatusText,
    CapaPriority Priority,
    string PriorityText,
    // Detaylar
    string Description,
    string? ObjectiveStatement,
    string? ScopeDefinition,
    // Sorumluluk
    string ResponsiblePerson,
    int? ResponsibleUserId,
    string? ResponsibleDepartment,
    // Planlama
    DateTime DueDate,
    DateTime? PlannedStartDate,
    DateTime? PlannedEndDate,
    // Gerçekleşen
    DateTime? ActualStartDate,
    DateTime? ActualEndDate,
    decimal CompletionPercent,
    // Kök neden
    RootCauseCategory? RootCauseCategory,
    string? RootCauseDescription,
    // Uygulama
    string? ActionPlan,
    string? ImplementationNotes,
    string? ResourcesRequired,
    decimal? EstimatedCost,
    decimal? ActualCost,
    // Doğrulama
    string? VerificationMethod,
    string? VerificationResult,
    string? VerifiedBy,
    DateTime? VerificationDate,
    // Etkinlik
    bool? IsEffective,
    string? EffectivenessNotes,
    DateTime? EffectivenessReviewDate,
    // Kapatma
    DateTime? ClosedDate,
    string? ClosedBy,
    string? ClosureNotes,
    // Meta
    string? Notes,
    string? Attachments,
    string? CreatedBy,
    DateTime CreatedDate,
    bool IsActive,
    int AgeDays,
    int DaysUntilDue,
    bool IsOverdue,
    IReadOnlyList<CapaTaskDto>? Tasks);

public record CorrectivePreventiveActionListDto(
    int Id,
    string CapaNumber,
    int? NonConformanceReportId,
    string? NcrNumber,
    CapaType Type,
    string TypeText,
    CapaStatus Status,
    string StatusText,
    CapaPriority Priority,
    string PriorityText,
    string Description,
    string ResponsiblePerson,
    string? ResponsibleDepartment,
    DateTime DueDate,
    decimal CompletionPercent,
    decimal? EstimatedCost,
    DateTime? ClosedDate,
    int AgeDays,
    int DaysUntilDue,
    bool IsOverdue,
    int TaskCount,
    int CompletedTaskCount,
    bool IsActive);

public record CapaTaskDto(
    int Id,
    int CorrectivePreventiveActionId,
    int SequenceNumber,
    string Description,
    string AssignedTo,
    int? AssignedUserId,
    DateTime DueDate,
    DateTime? CompletedDate,
    bool IsCompleted,
    string? Result,
    string? Notes,
    decimal? EstimatedCost,
    decimal? ActualCost);

#endregion

#region Request DTOs

public record CreateNcrRequest(
    int ProductId,
    string Title,
    string Description,
    NcrSource Source,
    NcrSeverity Severity,
    decimal AffectedQuantity,
    string Unit = "Adet",
    string? ProductCode = null,
    string? ProductName = null,
    string? LotNumber = null,
    string? SerialNumber = null,
    int? ProductionOrderId = null,
    int? ProductionOperationId = null,
    int? QualityInspectionId = null,
    int? WorkCenterId = null,
    int? WarehouseId = null,
    string? DetectionLocation = null,
    string? DefectType = null,
    string? DefectCode = null,
    string? SpecificationReference = null,
    string? ActualValue = null,
    string? ExpectedValue = null,
    int? CustomerId = null,
    string? CustomerName = null,
    int? SupplierId = null,
    string? SupplierName = null,
    bool CustomerNotificationRequired = false,
    decimal? EstimatedCost = null,
    string? Notes = null);

public record UpdateNcrRequest(
    string Title,
    string Description,
    NcrSeverity Severity,
    decimal AffectedQuantity,
    string? DefectType = null,
    string? DefectCode = null,
    string? SpecificationReference = null,
    string? ActualValue = null,
    string? ExpectedValue = null,
    string? DetectionLocation = null,
    decimal? EstimatedCost = null,
    string? Notes = null);

public record StartNcrInvestigationRequest(
    string InvestigatedBy);

public record RecordNcrInvestigationNotesRequest(
    string Notes);

public record SetNcrRootCauseRequest(
    RootCauseCategory Category,
    string Description,
    string? FiveWhyAnalysisJson = null,
    string? IshikawaDiagramJson = null);

public record SetNcrDispositionRequest(
    NcrDisposition Disposition,
    string Reason,
    string ApprovedBy);

public record AddNcrContainmentActionRequest(
    string Action,
    string ResponsiblePerson,
    DateTime DueDate,
    string? Notes = null);

public record CompleteNcrContainmentActionRequest(
    int ContainmentActionId,
    string Result);

public record CloseNcrRequest(
    string ClosedBy,
    string ClosureNotes);

public record CreateCapaRequest(
    CapaType Type,
    string Description,
    string ResponsiblePerson,
    DateTime DueDate,
    int? NonConformanceReportId = null,
    CapaPriority Priority = CapaPriority.Normal,
    string? ObjectiveStatement = null,
    string? ScopeDefinition = null,
    int? ResponsibleUserId = null,
    string? ResponsibleDepartment = null,
    DateTime? PlannedStartDate = null,
    DateTime? PlannedEndDate = null,
    RootCauseCategory? RootCauseCategory = null,
    string? RootCauseDescription = null,
    string? ActionPlan = null,
    string? ResourcesRequired = null,
    decimal? EstimatedCost = null,
    string? VerificationMethod = null,
    string? Notes = null);

public record UpdateCapaRequest(
    string Description,
    CapaPriority Priority,
    DateTime DueDate,
    string? ObjectiveStatement = null,
    string? ScopeDefinition = null,
    string? ResponsibleDepartment = null,
    DateTime? PlannedStartDate = null,
    DateTime? PlannedEndDate = null,
    string? ActionPlan = null,
    string? ResourcesRequired = null,
    decimal? EstimatedCost = null,
    string? VerificationMethod = null,
    string? Notes = null);

public record SetCapaRootCauseRequest(
    RootCauseCategory Category,
    string Description);

public record UpdateCapaProgressRequest(
    decimal CompletionPercent,
    string? Notes = null);

public record VerifyCapaRequest(
    string Result,
    string VerifiedBy);

public record EvaluateCapaEffectivenessRequest(
    bool IsEffective,
    string Notes);

public record CloseCapaRequest(
    string ClosedBy,
    string ClosureNotes);

public record AddCapaTaskRequest(
    string Description,
    string AssignedTo,
    DateTime DueDate,
    int? AssignedUserId = null,
    decimal? EstimatedCost = null,
    string? Notes = null);

public record CompleteCapaTaskRequest(
    int TaskId,
    string Result,
    decimal? ActualCost = null);

#endregion

#region Statistics DTOs

public record NcrStatisticsDto(
    int TotalCount,
    int OpenCount,
    int ClosedCount,
    int CancelledCount,
    decimal AverageResolutionDays,
    IReadOnlyList<NcrBySourceDto> BySource,
    IReadOnlyList<NcrBySeverityDto> BySeverity,
    IReadOnlyList<NcrByDispositionDto> ByDisposition,
    IReadOnlyList<NcrByMonthDto> ByMonth);

public record NcrBySourceDto(NcrSource Source, string SourceText, int Count);
public record NcrBySeverityDto(NcrSeverity Severity, string SeverityText, int Count);
public record NcrByDispositionDto(NcrDisposition Disposition, string DispositionText, int Count);
public record NcrByMonthDto(int Year, int Month, int Count);

public record CapaStatisticsDto(
    int TotalCount,
    int OpenCount,
    int ClosedCount,
    int OverdueCount,
    decimal AverageResolutionDays,
    decimal EffectivenessRate,
    IReadOnlyList<CapaByTypeDto> ByType,
    IReadOnlyList<CapaByStatusDto> ByStatus,
    IReadOnlyList<CapaByPriorityDto> ByPriority);

public record CapaByTypeDto(CapaType Type, string TypeText, int Count);
public record CapaByStatusDto(CapaStatus Status, string StatusText, int Count);
public record CapaByPriorityDto(CapaPriority Priority, string PriorityText, int Count);

#endregion
