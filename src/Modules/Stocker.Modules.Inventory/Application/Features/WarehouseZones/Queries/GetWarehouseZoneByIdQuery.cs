using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.WarehouseZones.Queries;

/// <summary>
/// Query to get a warehouse zone by ID
/// </summary>
public class GetWarehouseZoneByIdQuery : IRequest<Result<WarehouseZoneDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetWarehouseZoneByIdQuery
/// </summary>
public class GetWarehouseZoneByIdQueryHandler : IRequestHandler<GetWarehouseZoneByIdQuery, Result<WarehouseZoneDto>>
{
    private readonly IWarehouseZoneRepository _repository;

    public GetWarehouseZoneByIdQueryHandler(IWarehouseZoneRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<WarehouseZoneDto>> Handle(GetWarehouseZoneByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<WarehouseZoneDto>.Failure(new Error("WarehouseZone.NotFound", $"Warehouse zone with ID {request.Id} not found", ErrorType.NotFound));
        }

        var dto = new WarehouseZoneDto
        {
            Id = entity.Id,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.Warehouse?.Name,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            ZoneType = entity.ZoneType.ToString(),
            IsActive = entity.IsActive,
            IsTemperatureControlled = entity.IsTemperatureControlled,
            MinTemperature = entity.MinTemperature,
            MaxTemperature = entity.MaxTemperature,
            TargetTemperature = entity.TargetTemperature,
            RequiresTemperatureMonitoring = entity.RequiresTemperatureMonitoring,
            IsHumidityControlled = entity.IsHumidityControlled,
            MinHumidity = entity.MinHumidity,
            MaxHumidity = entity.MaxHumidity,
            IsHazardous = entity.IsHazardous,
            HazardClass = entity.HazardClass,
            UnNumber = entity.UnNumber,
            RequiresSpecialAccess = entity.RequiresSpecialAccess,
            AccessLevel = entity.AccessLevel,
            TotalArea = entity.TotalArea,
            UsableArea = entity.UsableArea,
            MaxPalletCapacity = entity.MaxPalletCapacity,
            MaxHeight = entity.MaxHeight,
            MaxWeightPerArea = entity.MaxWeightPerArea,
            Priority = entity.Priority,
            IsDefaultPickingZone = entity.IsDefaultPickingZone,
            IsDefaultPutawayZone = entity.IsDefaultPutawayZone,
            IsQuarantineZone = entity.IsQuarantineZone,
            IsReturnsZone = entity.IsReturnsZone,
            LocationCount = entity.Locations?.Count ?? 0,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<WarehouseZoneDto>.Success(dto);
    }
}
