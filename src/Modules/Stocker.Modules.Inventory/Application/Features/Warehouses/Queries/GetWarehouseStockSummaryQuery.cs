using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Warehouses.Queries;

/// <summary>
/// Query to get warehouse stock summary
/// </summary>
public class GetWarehouseStockSummaryQuery : IRequest<Result<WarehouseStockSummaryDto>>
{
    public int TenantId { get; set; }
    public int WarehouseId { get; set; }
}

/// <summary>
/// Handler for GetWarehouseStockSummaryQuery
/// </summary>
public class GetWarehouseStockSummaryQueryHandler : IRequestHandler<GetWarehouseStockSummaryQuery, Result<WarehouseStockSummaryDto>>
{
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IProductRepository _productRepository;

    public GetWarehouseStockSummaryQueryHandler(
        IWarehouseRepository warehouseRepository,
        IStockRepository stockRepository,
        IProductRepository productRepository)
    {
        _warehouseRepository = warehouseRepository;
        _stockRepository = stockRepository;
        _productRepository = productRepository;
    }

    public async Task<Result<WarehouseStockSummaryDto>> Handle(GetWarehouseStockSummaryQuery request, CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<WarehouseStockSummaryDto>.Failure(
                Error.NotFound("Warehouse", $"Warehouse with ID {request.WarehouseId} not found"));
        }

        var stocks = await _stockRepository.GetByWarehouseAsync(request.WarehouseId, cancellationToken);

        var totalProducts = stocks.Select(s => s.ProductId).Distinct().Count();
        var totalQuantity = stocks.Sum(s => s.Quantity);
        var totalReservedQuantity = stocks.Sum(s => s.ReservedQuantity);
        var lowStockItems = stocks.Count(s => s.Quantity > 0 && s.Quantity < 10); // Threshold can be adjusted
        var outOfStockItems = stocks.Count(s => s.Quantity <= 0);

        var summary = new WarehouseStockSummaryDto
        {
            WarehouseId = warehouse.Id,
            WarehouseName = warehouse.Name,
            TotalProducts = totalProducts,
            TotalQuantity = totalQuantity,
            TotalReserved = totalReservedQuantity,
            TotalValue = 0, // Would need product prices to calculate
            LowStockItems = lowStockItems,
            OutOfStockItems = outOfStockItems
        };

        return Result<WarehouseStockSummaryDto>.Success(summary);
    }
}
