using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Queries;

/// <summary>
/// Query to get stock by warehouse
/// </summary>
public class GetStockQuery : IRequest<Result<List<StockDto>>>
{
    public int TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public int? ProductId { get; set; }
    public int? LocationId { get; set; }
}

/// <summary>
/// Handler for GetStockQuery
/// </summary>
public class GetStockQueryHandler : IRequestHandler<GetStockQuery, Result<List<StockDto>>>
{
    private readonly IStockRepository _stockRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public GetStockQueryHandler(
        IStockRepository stockRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockRepository = stockRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<List<StockDto>>> Handle(GetStockQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Stock> stocks;

        if (request.WarehouseId.HasValue)
        {
            stocks = await _stockRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else if (request.ProductId.HasValue)
        {
            stocks = await _stockRepository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else
        {
            stocks = await _stockRepository.GetAllAsync(cancellationToken);
        }

        if (request.LocationId.HasValue)
        {
            stocks = stocks.Where(s => s.LocationId == request.LocationId.Value).ToList();
        }

        var stockDtos = new List<StockDto>();

        foreach (var stock in stocks)
        {
            var product = await _productRepository.GetByIdAsync(stock.ProductId, cancellationToken);
            var warehouse = await _warehouseRepository.GetByIdAsync(stock.WarehouseId, cancellationToken);

            stockDtos.Add(new StockDto
            {
                Id = stock.Id,
                ProductId = stock.ProductId,
                ProductCode = product?.Code ?? string.Empty,
                ProductName = product?.Name ?? string.Empty,
                WarehouseId = stock.WarehouseId,
                WarehouseName = warehouse?.Name ?? string.Empty,
                LocationId = stock.LocationId,
                Quantity = stock.Quantity,
                ReservedQuantity = stock.ReservedQuantity,
                AvailableQuantity = stock.AvailableQuantity,
                LastMovementDate = stock.LastMovementDate,
                LastCountDate = stock.LastCountDate
            });
        }

        return Result<List<StockDto>>.Success(stockDtos);
    }
}
