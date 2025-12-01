using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Queries;

/// <summary>
/// Query to get products with low stock
/// </summary>
public class GetLowStockProductsQuery : IRequest<Result<List<LowStockProductDto>>>
{
    public int TenantId { get; set; }
    public int? WarehouseId { get; set; }
}

/// <summary>
/// DTO for low stock products
/// </summary>
public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = null!;
    public decimal CurrentStock { get; set; }
    public decimal MinimumStock { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal Shortage { get; set; }
}

/// <summary>
/// Handler for GetLowStockProductsQuery
/// </summary>
public class GetLowStockProductsQueryHandler : IRequestHandler<GetLowStockProductsQuery, Result<List<LowStockProductDto>>>
{
    private readonly IStockRepository _stockRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public GetLowStockProductsQueryHandler(
        IStockRepository stockRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockRepository = stockRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<List<LowStockProductDto>>> Handle(GetLowStockProductsQuery request, CancellationToken cancellationToken)
    {
        var lowStockItems = await _stockRepository.GetLowStockItemsAsync(cancellationToken);

        if (request.WarehouseId.HasValue)
        {
            lowStockItems = lowStockItems.Where(s => s.WarehouseId == request.WarehouseId.Value).ToList();
        }

        var result = new List<LowStockProductDto>();

        foreach (var stock in lowStockItems)
        {
            var product = await _productRepository.GetByIdAsync(stock.ProductId, cancellationToken);
            var warehouse = await _warehouseRepository.GetByIdAsync(stock.WarehouseId, cancellationToken);

            if (product != null && warehouse != null)
            {
                result.Add(new LowStockProductDto
                {
                    ProductId = product.Id,
                    ProductCode = product.Code,
                    ProductName = product.Name,
                    WarehouseId = warehouse.Id,
                    WarehouseName = warehouse.Name,
                    CurrentStock = stock.Quantity,
                    MinimumStock = product.MinimumStock,
                    ReorderPoint = product.ReorderPoint,
                    Shortage = product.MinimumStock - stock.Quantity
                });
            }
        }

        return Result<List<LowStockProductDto>>.Success(result);
    }
}
