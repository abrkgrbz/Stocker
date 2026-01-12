using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Machines.Queries;

public record GetMachineQuery(int Id) : IRequest<MachineDto>;

public class GetMachineQueryHandler : IRequestHandler<GetMachineQuery, MachineDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMachineQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MachineDto> Handle(GetMachineQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var machine = await _unitOfWork.Machines.GetByIdAsync(tenantId, query.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{query.Id}' olan makine bulunamadı.");

        return MapToDto(machine);
    }

    private static MachineDto MapToDto(Machine entity) => new(
        entity.Id,
        entity.WorkCenterId,
        entity.WorkCenter?.Code,
        entity.WorkCenter?.Name,
        entity.Code,
        entity.Name,
        entity.Description,
        entity.Status.ToString(),
        entity.Manufacturer,
        entity.Model,
        entity.SerialNumber,
        entity.HourlyCapacity,
        entity.EfficiencyRate,
        entity.HourlyCost,
        entity.SetupCost,
        entity.MaintenanceCostPerHour,
        entity.PowerConsumptionKw,
        entity.AvailabilityRate,
        entity.PerformanceRate,
        entity.QualityRate,
        entity.CalculateOee(),
        entity.TotalOperatingHours,
        entity.PurchaseDate,
        entity.InstallationDate,
        entity.WarrantyExpiryDate,
        entity.LastMaintenanceDate,
        entity.NextMaintenanceDate,
        entity.MaintenanceIntervalDays,
        entity.DisplayOrder,
        entity.IsActive,
        entity.CreatedDate);
}
