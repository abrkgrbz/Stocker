using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Queries;

/// <summary>
/// Query to get locations for a warehouse
/// </summary>
public class GetWarehouseLocationsQuery : IRequest<Result<List<LocationDto>>>
{
    public int TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for GetWarehouseLocationsQuery
/// </summary>
public class GetWarehouseLocationsQueryHandler : IRequestHandler<GetWarehouseLocationsQuery, Result<List<LocationDto>>>
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IStockRepository _stockRepository;

    public GetWarehouseLocationsQueryHandler(
        IWarehouseRepository warehouseRepository,
        ILocationRepository locationRepository,
        IStockRepository stockRepository)
    {
        _warehouseRepository = warehouseRepository;
        _locationRepository = locationRepository;
        _stockRepository = stockRepository;
    }

    public async Task<Result<List<LocationDto>>> Handle(GetWarehouseLocationsQuery request, CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseId, cancellationToken);

        if (warehouse == null)
        {
            return Result<List<LocationDto>>.Failure(
                Error.NotFound("Warehouse", $"Warehouse with ID {request.WarehouseId} not found"));
        }

        var locations = await _locationRepository.GetByWarehouseAsync(request.WarehouseId, cancellationToken);

        var locationDtos = new List<LocationDto>();

        foreach (var location in locations)
        {
            var stocks = await _stockRepository.GetByLocationAsync(location.Id, cancellationToken);
            var productCount = stocks.Select(s => s.ProductId).Distinct().Count();

            locationDtos.Add(new LocationDto
            {
                Id = location.Id,
                Code = location.Code,
                Name = location.Name,
                WarehouseId = location.WarehouseId,
                WarehouseName = warehouse.Name,
                Capacity = location.Capacity,
                UsedCapacity = location.UsedCapacity,
                IsActive = location.IsActive,
                ProductCount = productCount
            });
        }

        return Result<List<LocationDto>>.Success(locationDtos);
    }
}
