using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Queries;

/// <summary>
/// Query to get a warehouse by ID
/// </summary>
public class GetWarehouseByIdQuery : IRequest<Result<WarehouseDto>>
{
    public Guid TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for GetWarehouseByIdQuery
/// </summary>
public class GetWarehouseByIdQueryHandler : IRequestHandler<GetWarehouseByIdQuery, Result<WarehouseDto>>
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IStockRepository _stockRepository;

    public GetWarehouseByIdQueryHandler(
        IWarehouseRepository warehouseRepository,
        ILocationRepository locationRepository,
        IStockRepository stockRepository)
    {
        _warehouseRepository = warehouseRepository;
        _locationRepository = locationRepository;
        _stockRepository = stockRepository;
    }

    public async Task<Result<WarehouseDto>> Handle(GetWarehouseByIdQuery request, CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseId, cancellationToken);

        if (warehouse == null)
        {
            return Result<WarehouseDto>.Failure(
                Error.NotFound("Warehouse", $"Warehouse with ID {request.WarehouseId} not found"));
        }

        var locations = await _locationRepository.GetByWarehouseAsync(warehouse.Id, cancellationToken);
        var stocks = await _stockRepository.GetByWarehouseAsync(warehouse.Id, cancellationToken);
        var productCount = stocks.Select(s => s.ProductId).Distinct().Count();

        var warehouseDto = new WarehouseDto
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
        };

        return Result<WarehouseDto>.Success(warehouseDto);
    }
}
