using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Locations.Queries;

/// <summary>
/// Query to get locations
/// </summary>
public class GetLocationsQuery : IRequest<Result<List<LocationListDto>>>
{
    public Guid TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetLocationsQuery
/// </summary>
public class GetLocationsQueryHandler : IRequestHandler<GetLocationsQuery, Result<List<LocationListDto>>>
{
    private readonly ILocationRepository _locationRepository;

    public GetLocationsQueryHandler(ILocationRepository locationRepository)
    {
        _locationRepository = locationRepository;
    }

    public async Task<Result<List<LocationListDto>>> Handle(GetLocationsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Location> locations;

        if (request.WarehouseId.HasValue)
        {
            locations = request.IncludeInactive
                ? await _locationRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken)
                : await _locationRepository.GetActiveByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else
        {
            locations = await _locationRepository.GetAllAsync(cancellationToken);
            if (!request.IncludeInactive)
            {
                locations = locations.Where(l => l.IsActive).ToList();
            }
        }

        var dtos = locations.Select(l => new LocationListDto
        {
            Id = l.Id,
            Code = l.Code,
            Name = l.Name,
            WarehouseName = l.Warehouse?.Name,
            Aisle = l.Aisle,
            Shelf = l.Shelf,
            Bin = l.Bin,
            FullPath = BuildFullPath(l.Aisle, l.Shelf, l.Bin),
            Capacity = l.Capacity,
            UsedCapacity = l.UsedCapacity,
            CapacityUsagePercent = l.Capacity > 0 ? (l.UsedCapacity / l.Capacity) * 100 : 0,
            IsActive = l.IsActive
        }).ToList();

        return Result<List<LocationListDto>>.Success(dtos);
    }

    private static string BuildFullPath(string? aisle, string? shelf, string? bin)
    {
        var parts = new List<string>();
        if (!string.IsNullOrEmpty(aisle)) parts.Add(aisle);
        if (!string.IsNullOrEmpty(shelf)) parts.Add(shelf);
        if (!string.IsNullOrEmpty(bin)) parts.Add(bin);
        return string.Join("-", parts);
    }
}
