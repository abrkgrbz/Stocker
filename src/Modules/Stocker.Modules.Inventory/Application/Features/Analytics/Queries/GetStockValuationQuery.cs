using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Analytics.Queries;

/// <summary>
/// Query to get stock valuation report
/// </summary>
public class GetStockValuationQuery : IRequest<Result<StockValuationDto>>
{
    public Guid TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public int? CategoryId { get; set; }
    public DateTime? AsOfDate { get; set; }
}

public class StockValuationDto
{
    public DateTime AsOfDate { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalQuantity { get; set; }
    public int TotalProducts { get; set; }
    public int TotalSKUs { get; set; }
    public string Currency { get; set; } = "TRY";

    public ValuationSummaryDto Summary { get; set; } = new();
    public List<ProductValuationDto> Products { get; set; } = new();
    public List<CategoryValuationDto> ByCategory { get; set; } = new();
    public List<WarehouseValuationDto> ByWarehouse { get; set; } = new();
}

public class ValuationSummaryDto
{
    public decimal AverageUnitCost { get; set; }
    public decimal HighestValueProduct { get; set; }
    public decimal LowestValueProduct { get; set; }
    public decimal MedianProductValue { get; set; }
    public decimal ValueChangePercent { get; set; } // vs last month
}

public class ProductValuationDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    public string? SKU { get; set; }
    public string? CategoryName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public decimal PercentageOfTotal { get; set; }
}

public class CategoryValuationDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal PercentageOfTotal { get; set; }
}

public class WarehouseValuationDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = null!;
    public string? WarehouseCode { get; set; }
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal PercentageOfTotal { get; set; }
}

/// <summary>
/// Handler for GetStockValuationQuery
/// </summary>
public class GetStockValuationQueryHandler : IRequestHandler<GetStockValuationQuery, Result<StockValuationDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IStockRepository _stockRepository;

    public GetStockValuationQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IWarehouseRepository warehouseRepository,
        IStockRepository stockRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _warehouseRepository = warehouseRepository;
        _stockRepository = stockRepository;
    }

    public async Task<Result<StockValuationDto>> Handle(GetStockValuationQuery request, CancellationToken cancellationToken)
    {
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        var warehouses = await _warehouseRepository.GetAllAsync(cancellationToken);
        var stocks = await _stockRepository.GetAllAsync(cancellationToken);

        // Apply filters
        if (request.WarehouseId.HasValue)
        {
            stocks = stocks.Where(s => s.WarehouseId == request.WarehouseId.Value).ToList();
        }

        if (request.CategoryId.HasValue)
        {
            var categoryProductIds = products
                .Where(p => p.CategoryId == request.CategoryId.Value)
                .Select(p => p.Id)
                .ToHashSet();
            stocks = stocks.Where(s => categoryProductIds.Contains(s.ProductId)).ToList();
        }

        var result = new StockValuationDto
        {
            AsOfDate = asOfDate
        };

        // Calculate product valuations
        var productValuations = stocks
            .GroupBy(s => s.ProductId)
            .Select(g =>
            {
                var product = products.FirstOrDefault(p => p.Id == g.Key);
                var category = product != null
                    ? categories.FirstOrDefault(c => c.Id == product.CategoryId)
                    : null;
                var totalQty = g.Sum(s => s.Quantity);
                var unitCost = product?.UnitPrice?.Amount ?? 0;

                return new ProductValuationDto
                {
                    ProductId = g.Key,
                    ProductCode = product?.Code ?? "",
                    ProductName = product?.Name ?? "",
                    SKU = product?.SKU,
                    CategoryName = category?.Name,
                    Quantity = totalQty,
                    UnitCost = unitCost,
                    TotalValue = totalQty * unitCost
                };
            })
            .Where(p => p.Quantity > 0)
            .OrderByDescending(p => p.TotalValue)
            .ToList();

        result.TotalValue = productValuations.Sum(p => p.TotalValue);
        result.TotalQuantity = productValuations.Sum(p => p.Quantity);
        result.TotalProducts = productValuations.Count;
        result.TotalSKUs = productValuations.Count(p => !string.IsNullOrEmpty(p.SKU));

        // Calculate percentages
        foreach (var pv in productValuations)
        {
            pv.PercentageOfTotal = result.TotalValue > 0
                ? (pv.TotalValue / result.TotalValue) * 100
                : 0;
        }

        result.Products = productValuations.Take(100).ToList();

        // Summary statistics
        var values = productValuations.Select(p => p.TotalValue).OrderBy(v => v).ToList();
        result.Summary = new ValuationSummaryDto
        {
            AverageUnitCost = productValuations.Any()
                ? productValuations.Average(p => p.UnitCost)
                : 0,
            HighestValueProduct = values.Any() ? values.Last() : 0,
            LowestValueProduct = values.Any() ? values.First() : 0,
            MedianProductValue = values.Any()
                ? values[values.Count / 2]
                : 0
        };

        // By Category
        result.ByCategory = productValuations
            .Where(p => !string.IsNullOrEmpty(p.CategoryName))
            .GroupBy(p => p.CategoryName!)
            .Select(g =>
            {
                var category = categories.FirstOrDefault(c => c.Name == g.Key);
                var totalValue = g.Sum(p => p.TotalValue);

                return new CategoryValuationDto
                {
                    CategoryId = category?.Id ?? 0,
                    CategoryName = g.Key,
                    ProductCount = g.Count(),
                    TotalQuantity = g.Sum(p => p.Quantity),
                    TotalValue = totalValue,
                    PercentageOfTotal = result.TotalValue > 0
                        ? (totalValue / result.TotalValue) * 100
                        : 0
                };
            })
            .OrderByDescending(c => c.TotalValue)
            .ToList();

        // By Warehouse
        result.ByWarehouse = stocks
            .GroupBy(s => s.WarehouseId)
            .Select(g =>
            {
                var warehouse = warehouses.FirstOrDefault(w => w.Id == g.Key);
                var warehouseValue = g.Sum(s =>
                {
                    var product = products.FirstOrDefault(p => p.Id == s.ProductId);
                    return s.Quantity * (product?.UnitPrice?.Amount ?? 0);
                });

                return new WarehouseValuationDto
                {
                    WarehouseId = g.Key,
                    WarehouseName = warehouse?.Name ?? "",
                    WarehouseCode = warehouse?.Code,
                    ProductCount = g.Select(s => s.ProductId).Distinct().Count(),
                    TotalQuantity = g.Sum(s => s.Quantity),
                    TotalValue = warehouseValue,
                    PercentageOfTotal = result.TotalValue > 0
                        ? (warehouseValue / result.TotalValue) * 100
                        : 0
                };
            })
            .OrderByDescending(w => w.TotalValue)
            .ToList();

        return Result<StockValuationDto>.Success(result);
    }
}
