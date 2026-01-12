using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Machines.Queries;

public record GetMachinesQuery(
    int? WorkCenterId = null,
    string? Status = null,
    bool? ActiveOnly = null) : IRequest<IReadOnlyList<MachineListDto>>;

public class GetMachinesQueryHandler : IRequestHandler<GetMachinesQuery, IReadOnlyList<MachineListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMachinesQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MachineListDto>> Handle(GetMachinesQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<Machine> machines;

        if (query.WorkCenterId.HasValue)
        {
            machines = await _unitOfWork.Machines.GetByWorkCenterAsync(tenantId, query.WorkCenterId.Value, cancellationToken);
        }
        else if (query.ActiveOnly == true)
        {
            machines = await _unitOfWork.Machines.GetActiveAsync(tenantId, cancellationToken);
        }
        else
        {
            machines = await _unitOfWork.Machines.GetAllAsync(tenantId, cancellationToken);
        }

        // Apply additional filters
        var filtered = machines.AsEnumerable();

        if (!string.IsNullOrEmpty(query.Status))
        {
            filtered = filtered.Where(m => m.Status.ToString() == query.Status);
        }

        return filtered.Select(MapToListDto).ToList();
    }

    private static MachineListDto MapToListDto(Machine entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.WorkCenterId,
        entity.WorkCenter?.Code,
        entity.WorkCenter?.Name,
        entity.Status.ToString(),
        entity.EfficiencyRate,
        entity.CalculateOee(),
        entity.NextMaintenanceDate,
        entity.IsActive);
}
