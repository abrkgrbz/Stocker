using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.QualityInspections.Queries;

public record GetQualityInspectionsQuery(
    string? Type = null,
    string? Result = null,
    Guid? ProductId = null,
    Guid? ProductionOrderId = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    bool? OpenOnly = null,
    bool? WithNonConformance = null) : IRequest<IReadOnlyList<QualityInspectionListDto>>;

public class GetQualityInspectionsQueryHandler : IRequestHandler<GetQualityInspectionsQuery, IReadOnlyList<QualityInspectionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetQualityInspectionsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<QualityInspectionListDto>> Handle(GetQualityInspectionsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<QualityInspection> inspections;

        if (query.OpenOnly == true)
        {
            inspections = await _unitOfWork.QualityInspections.GetOpenAsync(tenantId, cancellationToken);
        }
        else if (query.WithNonConformance == true)
        {
            inspections = await _unitOfWork.QualityInspections.GetWithNonConformanceAsync(tenantId, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.Type))
        {
            inspections = await _unitOfWork.QualityInspections.GetByTypeAsync(tenantId, query.Type, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.Result))
        {
            inspections = await _unitOfWork.QualityInspections.GetByResultAsync(tenantId, query.Result, cancellationToken);
        }
        else if (query.ProductId.HasValue)
        {
            inspections = await _unitOfWork.QualityInspections.GetByProductAsync(tenantId, query.ProductId.Value, cancellationToken);
        }
        else if (query.ProductionOrderId.HasValue)
        {
            inspections = await _unitOfWork.QualityInspections.GetByProductionOrderAsync(query.ProductionOrderId.Value, cancellationToken);
        }
        else if (query.StartDate.HasValue && query.EndDate.HasValue)
        {
            inspections = await _unitOfWork.QualityInspections.GetByDateRangeAsync(tenantId, query.StartDate.Value, query.EndDate.Value, cancellationToken);
        }
        else
        {
            inspections = await _unitOfWork.QualityInspections.GetAllAsync(tenantId, cancellationToken);
        }

        return inspections.Select(MapToListDto).ToList();
    }

    private static QualityInspectionListDto MapToListDto(QualityInspection entity) => new(
        entity.Id,
        entity.InspectionNumber,
        entity.InspectionType,
        entity.ProductionOrderId,
        entity.ProductionOrder?.OrderNumber,
        entity.ProductId,
        null, // ProductCode - needs product service
        null, // ProductName
        entity.Result,
        entity.TotalDefects,
        entity.InspectorName,
        entity.InspectionDate,
        entity.Status);
}
