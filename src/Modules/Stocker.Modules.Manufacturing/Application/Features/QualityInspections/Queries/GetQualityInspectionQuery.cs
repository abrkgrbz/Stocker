using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.QualityInspections.Queries;

public record GetQualityInspectionQuery(Guid Id) : IRequest<QualityInspectionDto>;

public class GetQualityInspectionQueryHandler : IRequestHandler<GetQualityInspectionQuery, QualityInspectionDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetQualityInspectionQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<QualityInspectionDto> Handle(GetQualityInspectionQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var inspection = await _unitOfWork.QualityInspections.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{query.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı görüntüleme yetkiniz yok.");

        return MapToDto(inspection);
    }

    private static QualityInspectionDto MapToDto(QualityInspection entity) => new(
        entity.Id,
        entity.InspectionNumber,
        entity.InspectionType,
        entity.ProductionOrderId,
        entity.ProductionOrder?.OrderNumber,
        entity.ProductionOperationId,
        entity.ProductionReceiptId,
        entity.ProductId,
        null, // ProductCode
        null, // ProductName
        entity.LotNumber,
        entity.SampleSize,
        entity.InspectedQuantity,
        entity.AcceptedQuantity,
        entity.RejectedQuantity,
        entity.SamplingMethod,
        entity.AcceptanceCriteria,
        entity.QualityPlanId,
        entity.QualityPlanCode,
        entity.Result,
        entity.DefectRate,
        entity.TotalDefects,
        entity.CriticalDefects,
        entity.MajorDefects,
        entity.MinorDefects,
        entity.MeasurementResults,
        entity.InspectorId,
        entity.InspectorName,
        entity.InspectionDate,
        entity.StartTime,
        entity.EndTime,
        entity.InspectionDurationMinutes,
        entity.EquipmentUsed,
        entity.HasNonConformance,
        entity.NonConformanceDescription,
        entity.CorrectiveAction,
        entity.PreventiveAction,
        entity.DispositionDecision,
        entity.DispositionReason,
        entity.CertificateRequired,
        entity.CertificateNumber,
        entity.CertificateDate,
        entity.Status,
        entity.Notes,
        entity.CreatedAt,
        entity.Details?.Select(MapDetailToDto).ToList());

    private static QualityInspectionDetailDto MapDetailToDto(QualityInspectionDetail detail) => new(
        detail.Id,
        detail.SequenceNumber,
        detail.ParameterName,
        detail.ParameterCode,
        detail.ParameterType,
        detail.SpecificationValue,
        detail.NominalValue,
        detail.UpperLimit,
        detail.LowerLimit,
        detail.UnitOfMeasure,
        detail.MeasuredValue,
        detail.NumericValue,
        detail.Deviation,
        detail.IsWithinSpec,
        detail.Result,
        detail.MeasurementMethod,
        detail.MeasurementEquipment,
        detail.MeasurementDate,
        detail.Notes);
}
