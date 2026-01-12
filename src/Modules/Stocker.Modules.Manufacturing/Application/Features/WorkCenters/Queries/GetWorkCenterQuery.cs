using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Queries;

public record GetWorkCenterQuery(int Id) : IRequest<WorkCenterDto>;

public class GetWorkCenterQueryHandler : IRequestHandler<GetWorkCenterQuery, WorkCenterDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetWorkCenterQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkCenterDto> Handle(GetWorkCenterQuery query, CancellationToken cancellationToken)
    {
        var workCenter = await _unitOfWork.WorkCenters.GetByIdAsync(query.Id, cancellationToken)
            ?? throw new KeyNotFoundException("İş merkezi bulunamadı.");

        return MapToDto(workCenter);
    }

    private static WorkCenterDto MapToDto(WorkCenter entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Description,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.Capacity,
        entity.CapacityUnit,
        entity.EfficiencyRate,
        entity.HourlyLaborCost,
        entity.HourlyMachineCost,
        entity.HourlyOverheadCost,
        entity.TotalHourlyCost,
        entity.OEETarget,
        entity.LastOEE,
        entity.CostCenterId,
        entity.IsActive,
        entity.CreatedDate,
        entity.UpdatedDate);
}
