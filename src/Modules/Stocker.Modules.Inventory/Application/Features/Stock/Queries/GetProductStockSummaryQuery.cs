using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Queries;

/// <summary>
/// Query to get stock summary for a product across all warehouses
/// </summary>
public class GetProductStockSummaryQuery : IRequest<Result<ProductStockSummaryDto>>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
}

/// <summary>
/// DTO for product stock summary
/// </summary>
public class ProductStockSummaryDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public decimal TotalQuantity { get; set; }
    public decimal TotalReservedQuantity { get; set; }
    public decimal TotalAvailableQuantity { get; set; }
    public decimal MinimumStock { get; set; }
    public decimal ReorderPoint { get; set; }
    public List<WarehouseStockDto> WarehouseBreakdown { get; set; } = new();
}

/// <summary>
/// DTO for warehouse stock breakdown
/// </summary>
public class WarehouseStockDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
}

/// <summary>
/// Handler for GetProductStockSummaryQuery
/// </summary>
public class GetProductStockSummaryQueryHandler : IRequestHandler<GetProductStockSummaryQuery, Result<ProductStockSummaryDto>>
{
    private readonly IStockRepository _stockRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public GetProductStockSummaryQueryHandler(
        IStockRepository stockRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockRepository = stockRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<ProductStockSummaryDto>> Handle(GetProductStockSummaryQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);

        if (product == null)
        {
            return Result<ProductStockSummaryDto>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        var stocks = await _stockRepository.GetByProductAsync(request.ProductId, cancellationToken);

        var summary = new ProductStockSummaryDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            MinimumStock = product.MinimumStock,
            ReorderPoint = product.ReorderPoint
        };

        foreach (var stock in stocks)
        {
            var warehouse = await _warehouseRepository.GetByIdAsync(stock.WarehouseId, cancellationToken);

            summary.WarehouseBreakdown.Add(new WarehouseStockDto
            {
                WarehouseId = stock.WarehouseId,
                WarehouseName = warehouse?.Name ?? string.Empty,
                Quantity = stock.Quantity,
                ReservedQuantity = stock.ReservedQuantity,
                AvailableQuantity = stock.AvailableQuantity
            });
        }

        summary.TotalQuantity = summary.WarehouseBreakdown.Sum(w => w.Quantity);
        summary.TotalReservedQuantity = summary.WarehouseBreakdown.Sum(w => w.ReservedQuantity);
        summary.TotalAvailableQuantity = summary.WarehouseBreakdown.Sum(w => w.AvailableQuantity);

        return Result<ProductStockSummaryDto>.Success(summary);
    }
}
