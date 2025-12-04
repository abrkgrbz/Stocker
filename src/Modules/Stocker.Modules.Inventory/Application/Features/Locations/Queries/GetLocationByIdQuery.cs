using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Queries;

/// <summary>
/// Query to get a location by ID
/// </summary>
public class GetLocationByIdQuery : IRequest<Result<LocationDto>>
{
    public Guid TenantId { get; set; }
    public int LocationId { get; set; }
}

/// <summary>
/// Handler for GetLocationByIdQuery
/// </summary>
public class GetLocationByIdQueryHandler : IRequestHandler<GetLocationByIdQuery, Result<LocationDto>>
{
    private readonly ILocationRepository _locationRepository;

    public GetLocationByIdQueryHandler(ILocationRepository locationRepository)
    {
        _locationRepository = locationRepository;
    }

    public async Task<Result<LocationDto>> Handle(GetLocationByIdQuery request, CancellationToken cancellationToken)
    {
        var location = await _locationRepository.GetByIdAsync(request.LocationId, cancellationToken);

        if (location == null)
        {
            return Result<LocationDto>.Failure(new Error("Location.NotFound", $"Location with ID {request.LocationId} not found", ErrorType.NotFound));
        }

        var dto = new LocationDto
        {
            Id = location.Id,
            WarehouseId = location.WarehouseId,
            WarehouseName = location.Warehouse?.Name,
            Code = location.Code,
            Name = location.Name,
            Description = location.Description,
            Aisle = location.Aisle,
            Shelf = location.Shelf,
            Bin = location.Bin,
            Capacity = location.Capacity,
            UsedCapacity = location.UsedCapacity,
            AvailableCapacity = location.Capacity - location.UsedCapacity,
            IsActive = location.IsActive,
            CreatedAt = location.CreatedDate,
            UpdatedAt = location.UpdatedDate,
            ProductCount = location.Stocks?.Count ?? 0
        };

        return Result<LocationDto>.Success(dto);
    }
}
