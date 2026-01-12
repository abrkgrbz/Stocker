using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Queries;

public record GetWorkCentersQuery(bool? ActiveOnly = null, string? Type = null) : IRequest<IReadOnlyList<WorkCenterListDto>>;

public class GetWorkCentersQueryHandler : IRequestHandler<GetWorkCentersQuery, IReadOnlyList<WorkCenterListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetWorkCentersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<WorkCenterListDto>> Handle(GetWorkCentersQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<WorkCenter> workCenters;

        if (query.ActiveOnly == true)
        {
            workCenters = await _unitOfWork.WorkCenters.GetActiveAsync(tenantId, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.Type))
        {
            workCenters = await _unitOfWork.WorkCenters.GetByTypeAsync(tenantId, query.Type, cancellationToken);
        }
        else
        {
            workCenters = await _unitOfWork.WorkCenters.GetAllAsync(tenantId, cancellationToken);
        }

        return workCenters.Select(MapToListDto).ToList();
    }

    private static WorkCenterListDto MapToListDto(WorkCenter entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.Capacity,
        entity.EfficiencyRate,
        entity.LastOEE,
        entity.IsActive);
}
