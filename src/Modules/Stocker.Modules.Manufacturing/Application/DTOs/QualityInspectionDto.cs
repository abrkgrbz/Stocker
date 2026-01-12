namespace Stocker.Modules.Manufacturing.Application.DTOs;

public record QualityInspectionDto(
    Guid Id,
    string InspectionNumber,
    string InspectionType,
    Guid? ProductionOrderId,
    string? ProductionOrderNumber,
    Guid? ProductionOperationId,
    Guid? ProductionReceiptId,
    Guid ProductId,
    string? ProductCode,
    string? ProductName,
    string? LotNumber,
    decimal SampleSize,
    decimal InspectedQuantity,
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    string SamplingMethod,
    string AcceptanceCriteria,
    Guid? QualityPlanId,
    string? QualityPlanCode,
    string Result,
    decimal? DefectRate,
    int TotalDefects,
    int CriticalDefects,
    int MajorDefects,
    int MinorDefects,
    string? MeasurementResults,
    Guid InspectorId,
    string? InspectorName,
    DateTime InspectionDate,
    DateTime? StartTime,
    DateTime? EndTime,
    decimal? InspectionDurationMinutes,
    string? EquipmentUsed,
    bool HasNonConformance,
    string? NonConformanceDescription,
    string? CorrectiveAction,
    string? PreventiveAction,
    string? DispositionDecision,
    string? DispositionReason,
    bool CertificateRequired,
    string? CertificateNumber,
    DateTime? CertificateDate,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    IReadOnlyList<QualityInspectionDetailDto>? Details);

public record QualityInspectionListDto(
    Guid Id,
    string InspectionNumber,
    string InspectionType,
    Guid? ProductionOrderId,
    string? ProductionOrderNumber,
    Guid ProductId,
    string? ProductCode,
    string? ProductName,
    string Result,
    int TotalDefects,
    string? InspectorName,
    DateTime InspectionDate,
    string Status);

public record QualityInspectionDetailDto(
    Guid Id,
    int SequenceNumber,
    string ParameterName,
    string ParameterCode,
    string ParameterType,
    string? SpecificationValue,
    decimal? NominalValue,
    decimal? UpperLimit,
    decimal? LowerLimit,
    string UnitOfMeasure,
    string? MeasuredValue,
    decimal? NumericValue,
    decimal? Deviation,
    bool IsWithinSpec,
    string Result,
    string? MeasurementMethod,
    string? MeasurementEquipment,
    DateTime? MeasurementDate,
    string? Notes);

public record CreateQualityInspectionRequest(
    string InspectionType,
    Guid ProductId,
    Guid? ProductionOrderId = null,
    Guid? ProductionOperationId = null,
    Guid? ProductionReceiptId = null,
    string? LotNumber = null,
    decimal SampleSize = 1,
    string SamplingMethod = "Rastgele",
    string AcceptanceCriteria = "Standart",
    Guid? QualityPlanId = null,
    string? EquipmentUsed = null,
    string? Notes = null);

public record StartInspectionRequest(
    string? InspectorName);

public record RecordInspectionResultRequest(
    string Result,
    decimal InspectedQuantity,
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    int CriticalDefects = 0,
    int MajorDefects = 0,
    int MinorDefects = 0,
    string? MeasurementResults = null);

public record RecordNonConformanceRequest(
    string Description,
    string? CorrectiveAction = null,
    string? PreventiveAction = null);

public record SetDispositionRequest(
    string Decision,
    string Reason);

public record AddInspectionDetailRequest(
    int SequenceNumber,
    string ParameterName,
    string ParameterCode,
    string ParameterType,
    string UnitOfMeasure,
    decimal? NominalValue = null,
    decimal? UpperLimit = null,
    decimal? LowerLimit = null,
    string? SpecificationValue = null);

public record RecordMeasurementRequest(
    Guid DetailId,
    decimal? NumericValue = null,
    string? MeasuredValue = null,
    string? Method = null,
    string? Equipment = null);
