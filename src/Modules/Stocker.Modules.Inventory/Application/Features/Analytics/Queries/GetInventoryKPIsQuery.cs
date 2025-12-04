using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Analytics.Queries;

/// <summary>
/// Query to get inventory KPIs for a specific period
/// </summary>
public class GetInventoryKPIsQuery : IRequest<Result<InventoryKPIsDto>>
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? WarehouseId { get; set; }
}

public class InventoryKPIsDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Turnover & Efficiency KPIs
    public decimal InventoryTurnoverRatio { get; set; }
    public decimal DaysOfInventory { get; set; }
    public decimal StockoutRate { get; set; }
    public decimal FillRate { get; set; }
    public decimal OrderAccuracyRate { get; set; }
    public decimal ReceivingEfficiency { get; set; }

    // Value KPIs
    public decimal GrossMarginReturnOnInventory { get; set; }
    public decimal CarryingCostPercentage { get; set; }
    public decimal ShrinkageRate { get; set; }
    public decimal DeadStockPercentage { get; set; }

    // Movement KPIs
    public int TotalInboundMovements { get; set; }
    public int TotalOutboundMovements { get; set; }
    public decimal TotalInboundQuantity { get; set; }
    public decimal TotalOutboundQuantity { get; set; }
    public decimal AverageMovementsPerDay { get; set; }

    // Comparison with previous period
    public KPIComparisonDto Comparison { get; set; } = new();

    // Detailed breakdowns
    public List<TurnoverByCategory> TurnoverByCategory { get; set; } = new();
    public List<MonthlyKPIDto> MonthlyTrend { get; set; } = new();
}

public class KPIComparisonDto
{
    public decimal TurnoverChange { get; set; }
    public decimal StockValueChange { get; set; }
    public decimal MovementsChange { get; set; }
    public string TurnoverTrend { get; set; } = "stable"; // up, down, stable
    public string StockValueTrend { get; set; } = "stable";
    public string MovementsTrend { get; set; } = "stable";
}

public class TurnoverByCategory
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public decimal TurnoverRatio { get; set; }
    public decimal DaysOfInventory { get; set; }
    public int ProductCount { get; set; }
}

public class MonthlyKPIDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = null!;
    public decimal TurnoverRatio { get; set; }
    public decimal StockValue { get; set; }
    public int MovementsCount { get; set; }
}

/// <summary>
/// Handler for GetInventoryKPIsQuery
/// </summary>
public class GetInventoryKPIsQueryHandler : IRequestHandler<GetInventoryKPIsQuery, Result<InventoryKPIsDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IStockMovementRepository _stockMovementRepository;

    public GetInventoryKPIsQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IStockRepository stockRepository,
        IStockMovementRepository stockMovementRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _stockRepository = stockRepository;
        _stockMovementRepository = stockMovementRepository;
    }

    public async Task<Result<InventoryKPIsDto>> Handle(GetInventoryKPIsQuery request, CancellationToken cancellationToken)
    {
        var result = new InventoryKPIsDto
        {
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        var stocks = await _stockRepository.GetAllAsync(cancellationToken);
        var movements = await _stockMovementRepository.GetByDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);

        // Apply warehouse filter
        if (request.WarehouseId.HasValue)
        {
            stocks = stocks.Where(s => s.WarehouseId == request.WarehouseId.Value).ToList();
            movements = movements.Where(m => m.WarehouseId == request.WarehouseId.Value).ToList();
        }

        var periodDays = (request.EndDate - request.StartDate).Days;
        if (periodDays <= 0) periodDays = 1;

        // Calculate current stock value
        var currentStockValue = stocks.Sum(s =>
        {
            var product = products.FirstOrDefault(p => p.Id == s.ProductId);
            return s.Quantity * (product?.UnitPrice?.Amount ?? 0);
        });

        // Movement analysis - using actual StockMovementType enum values
        var inboundTypes = new[]
        {
            Domain.Enums.StockMovementType.Purchase,
            Domain.Enums.StockMovementType.SalesReturn,
            Domain.Enums.StockMovementType.Production,
            Domain.Enums.StockMovementType.AdjustmentIncrease,
            Domain.Enums.StockMovementType.Opening,
            Domain.Enums.StockMovementType.Found
        };

        var outboundTypes = new[]
        {
            Domain.Enums.StockMovementType.Sales,
            Domain.Enums.StockMovementType.PurchaseReturn,
            Domain.Enums.StockMovementType.Consumption,
            Domain.Enums.StockMovementType.AdjustmentDecrease,
            Domain.Enums.StockMovementType.Damage,
            Domain.Enums.StockMovementType.Loss
        };

        var inboundMovements = movements.Where(m => inboundTypes.Contains(m.MovementType)).ToList();
        var outboundMovements = movements.Where(m => outboundTypes.Contains(m.MovementType)).ToList();

        result.TotalInboundMovements = inboundMovements.Count;
        result.TotalOutboundMovements = outboundMovements.Count;
        result.TotalInboundQuantity = inboundMovements.Sum(m => m.Quantity);
        result.TotalOutboundQuantity = outboundMovements.Sum(m => m.Quantity);
        result.AverageMovementsPerDay = movements.Count / (decimal)periodDays;

        // Inventory Turnover Ratio = Cost of Goods Sold / Average Inventory
        // Simplified: Using outbound value / average stock value
        var outboundValue = outboundMovements.Sum(m =>
        {
            var product = products.FirstOrDefault(p => p.Id == m.ProductId);
            return m.Quantity * (product?.UnitPrice?.Amount ?? 0);
        });

        var avgStockValue = currentStockValue; // Simplified - ideally would calculate true average
        result.InventoryTurnoverRatio = avgStockValue > 0
            ? Math.Round(outboundValue / avgStockValue, 2)
            : 0;

        // Days of Inventory = 365 / Turnover Ratio
        result.DaysOfInventory = result.InventoryTurnoverRatio > 0
            ? Math.Round(365 / result.InventoryTurnoverRatio, 1)
            : 0;

        // Stockout Rate = Products with 0 stock / Total Products
        var stockByProduct = stocks.GroupBy(s => s.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(s => s.Quantity));

        var activeProducts = products.Where(p => p.IsActive).ToList();
        var outOfStockCount = activeProducts.Count(p => !stockByProduct.ContainsKey(p.Id) || stockByProduct[p.Id] <= 0);
        result.StockoutRate = activeProducts.Any()
            ? Math.Round((decimal)outOfStockCount / activeProducts.Count * 100, 2)
            : 0;

        // Dead Stock Percentage (no movement in period)
        var movedProductIds = movements.Select(m => m.ProductId).Distinct().ToHashSet();
        var deadStockCount = activeProducts.Count(p => !movedProductIds.Contains(p.Id) && stockByProduct.ContainsKey(p.Id) && stockByProduct[p.Id] > 0);
        result.DeadStockPercentage = activeProducts.Any()
            ? Math.Round((decimal)deadStockCount / activeProducts.Count * 100, 2)
            : 0;

        // Shrinkage Rate (losses and damages / total outbound)
        var shrinkageTypes = new[] { Domain.Enums.StockMovementType.Damage, Domain.Enums.StockMovementType.Loss };
        var shrinkageQty = movements.Where(m => shrinkageTypes.Contains(m.MovementType)).Sum(m => m.Quantity);
        result.ShrinkageRate = result.TotalOutboundQuantity > 0
            ? Math.Round(shrinkageQty / result.TotalOutboundQuantity * 100, 2)
            : 0;

        // Turnover by Category
        result.TurnoverByCategory = categories
            .Select(c =>
            {
                var categoryProducts = products.Where(p => p.CategoryId == c.Id).ToList();
                var categoryProductIds = categoryProducts.Select(p => p.Id).ToHashSet();

                var categoryStockValue = stocks
                    .Where(s => categoryProductIds.Contains(s.ProductId))
                    .Sum(s =>
                    {
                        var product = categoryProducts.FirstOrDefault(p => p.Id == s.ProductId);
                        return s.Quantity * (product?.UnitPrice?.Amount ?? 0);
                    });

                var categoryOutboundValue = outboundMovements
                    .Where(m => categoryProductIds.Contains(m.ProductId))
                    .Sum(m =>
                    {
                        var product = categoryProducts.FirstOrDefault(p => p.Id == m.ProductId);
                        return m.Quantity * (product?.UnitPrice?.Amount ?? 0);
                    });

                var turnover = categoryStockValue > 0
                    ? Math.Round(categoryOutboundValue / categoryStockValue, 2)
                    : 0;

                return new TurnoverByCategory
                {
                    CategoryId = c.Id,
                    CategoryName = c.Name,
                    TurnoverRatio = turnover,
                    DaysOfInventory = turnover > 0 ? Math.Round(365 / turnover, 1) : 0,
                    ProductCount = categoryProducts.Count
                };
            })
            .Where(t => t.ProductCount > 0)
            .OrderByDescending(t => t.TurnoverRatio)
            .ToList();

        // Monthly Trend
        result.MonthlyTrend = movements
            .GroupBy(m => new { m.CreatedDate.Year, m.CreatedDate.Month })
            .Select(g =>
            {
                var monthMovements = g.ToList();
                var monthOutbound = monthMovements.Where(m => outboundTypes.Contains(m.MovementType)).ToList();
                var monthOutboundValue = monthOutbound.Sum(m =>
                {
                    var product = products.FirstOrDefault(p => p.Id == m.ProductId);
                    return m.Quantity * (product?.UnitPrice?.Amount ?? 0);
                });

                return new MonthlyKPIDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    TurnoverRatio = avgStockValue > 0 ? Math.Round(monthOutboundValue / avgStockValue, 2) : 0,
                    StockValue = avgStockValue, // Simplified
                    MovementsCount = monthMovements.Count
                };
            })
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        // Comparison with previous period
        var previousStart = request.StartDate.AddDays(-periodDays);
        var previousEnd = request.StartDate;
        var previousMovements = await _stockMovementRepository.GetByDateRangeAsync(previousStart, previousEnd, cancellationToken);

        if (request.WarehouseId.HasValue)
        {
            previousMovements = previousMovements.Where(m => m.WarehouseId == request.WarehouseId.Value).ToList();
        }

        var prevOutboundValue = previousMovements
            .Where(m => outboundTypes.Contains(m.MovementType))
            .Sum(m =>
            {
                var product = products.FirstOrDefault(p => p.Id == m.ProductId);
                return m.Quantity * (product?.UnitPrice?.Amount ?? 0);
            });

        var prevTurnover = avgStockValue > 0 ? prevOutboundValue / avgStockValue : 0;

        result.Comparison = new KPIComparisonDto
        {
            TurnoverChange = prevTurnover > 0
                ? Math.Round((result.InventoryTurnoverRatio - prevTurnover) / prevTurnover * 100, 2)
                : 0,
            MovementsChange = previousMovements.Any()
                ? Math.Round((decimal)(movements.Count - previousMovements.Count) / previousMovements.Count * 100, 2)
                : 0,
            TurnoverTrend = result.InventoryTurnoverRatio > prevTurnover ? "up" : result.InventoryTurnoverRatio < prevTurnover ? "down" : "stable",
            MovementsTrend = movements.Count > previousMovements.Count ? "up" : movements.Count < previousMovements.Count ? "down" : "stable"
        };

        return Result<InventoryKPIsDto>.Success(result);
    }
}
