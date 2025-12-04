using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Queries;

/// <summary>
/// Query to get all warehouses
/// </summary>
public class GetWarehousesQuery : IRequest<Result<List<WarehouseDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public int? BranchId { get; set; }
}

/// <summary>
/// Handler for GetWarehousesQuery
/// </summary>
public class GetWarehousesQueryHandler : IRequestHandler<GetWarehousesQuery, Result<List<WarehouseDto>>>
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IStockRepository _stockRepository;

    public GetWarehousesQueryHandler(
        IWarehouseRepository warehouseRepository,
        ILocationRepository locationRepository,
        IStockRepository stockRepository)
    {
        _warehouseRepository = warehouseRepository;
        _locationRepository = locationRepository;
        _stockRepository = stockRepository;
    }

    public async Task<Result<List<WarehouseDto>>> Handle(GetWarehousesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Warehouse> warehouses;

        if (request.BranchId.HasValue)
        {
            warehouses = await _warehouseRepository.GetByBranchAsync(request.BranchId, cancellationToken);
        }
        else
        {
            warehouses = request.IncludeInactive
                ? await _warehouseRepository.GetAllAsync(cancellationToken)
                : await _warehouseRepository.GetActiveWarehousesAsync(cancellationToken);
        }

        var warehouseDtos = new List<WarehouseDto>();

        foreach (var warehouse in warehouses)
        {
            var locations = await _locationRepository.GetByWarehouseAsync(warehouse.Id, cancellationToken);
            var stocks = await _stockRepository.GetByWarehouseAsync(warehouse.Id, cancellationToken);
            var productCount = stocks.Select(s => s.ProductId).Distinct().Count();

            warehouseDtos.Add(new WarehouseDto
            {
                Id = warehouse.Id,
                Code = warehouse.Code,
                Name = warehouse.Name,
                Description = warehouse.Description,
                BranchId = warehouse.BranchId,
                Street = warehouse.Address?.Street,
                City = warehouse.Address?.City,
                State = warehouse.Address?.State,
                Country = warehouse.Address?.Country,
                PostalCode = warehouse.Address?.PostalCode,
                Phone = warehouse.Phone?.Value,
                Manager = warehouse.Manager,
                TotalArea = warehouse.TotalArea,
                IsActive = warehouse.IsActive,
                IsDefault = warehouse.IsDefault,
                CreatedAt = warehouse.CreatedDate,
                LocationCount = locations.Count,
                ProductCount = productCount
            });
        }

        return Result<List<WarehouseDto>>.Success(warehouseDtos);
    }
}
