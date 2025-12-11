using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Queries;

/// <summary>
/// Query to get all warehouse zones
/// </summary>
public class GetWarehouseZonesQuery : IRequest<Result<List<WarehouseZoneDto>>>
{
    public Guid TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public string? ZoneType { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetWarehouseZonesQuery
/// </summary>
public class GetWarehouseZonesQueryHandler : IRequestHandler<GetWarehouseZonesQuery, Result<List<WarehouseZoneDto>>>
{
    private readonly IWarehouseZoneRepository _repository;

    public GetWarehouseZonesQueryHandler(IWarehouseZoneRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<WarehouseZoneDto>>> Handle(GetWarehouseZonesQuery request, CancellationToken cancellationToken)
    {
        var entities = request.WarehouseId.HasValue
            ? await _repository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken)
            : request.IncludeInactive
                ? await _repository.GetAllAsync(cancellationToken)
                : await _repository.GetActiveAsync(cancellationToken);

        var dtos = entities.Select(e => new WarehouseZoneDto
        {
            Id = e.Id,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            Code = e.Code,
            Name = e.Name,
            Description = e.Description,
            ZoneType = e.ZoneType.ToString(),
            IsActive = e.IsActive,
            IsTemperatureControlled = e.IsTemperatureControlled,
            MinTemperature = e.MinTemperature,
            MaxTemperature = e.MaxTemperature,
            TargetTemperature = e.TargetTemperature,
            RequiresTemperatureMonitoring = e.RequiresTemperatureMonitoring,
            IsHumidityControlled = e.IsHumidityControlled,
            MinHumidity = e.MinHumidity,
            MaxHumidity = e.MaxHumidity,
            IsHazardous = e.IsHazardous,
            HazardClass = e.HazardClass,
            UnNumber = e.UnNumber,
            RequiresSpecialAccess = e.RequiresSpecialAccess,
            AccessLevel = e.AccessLevel,
            TotalArea = e.TotalArea,
            UsableArea = e.UsableArea,
            MaxPalletCapacity = e.MaxPalletCapacity,
            MaxHeight = e.MaxHeight,
            MaxWeightPerArea = e.MaxWeightPerArea,
            Priority = e.Priority,
            IsDefaultPickingZone = e.IsDefaultPickingZone,
            IsDefaultPutawayZone = e.IsDefaultPutawayZone,
            IsQuarantineZone = e.IsQuarantineZone,
            IsReturnsZone = e.IsReturnsZone,
            LocationCount = e.Locations?.Count ?? 0,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<WarehouseZoneDto>>.Success(dtos);
    }
}
