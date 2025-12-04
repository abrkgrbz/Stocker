using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of stock forecasting and auto-reorder service
/// </summary>
public class StockForecastingService : IStockForecastingService
{
    private readonly InventoryDbContext _context;

    public StockForecastingService(InventoryDbContext context)
    {
        _context = context;
    }

    // =====================================
    // FORECASTING OPERATIONS
    // =====================================

    public async Task<ProductForecastDto?> GetProductForecastAsync(
        int productId,
        int? warehouseId = null,
        int forecastDays = 30,
        ForecastingMethod method = ForecastingMethod.ExponentialSmoothing,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        // Get stock data
        var stockQuery = _context.Stocks.Where(s => s.ProductId == productId);
        if (warehouseId.HasValue)
            stockQuery = stockQuery.Where(s => s.WarehouseId == warehouseId.Value);

        var stocks = await stockQuery.ToListAsync(cancellationToken);
        var totalStock = stocks.Sum(s => s.Quantity);
        var reservedStock = stocks.Sum(s => s.ReservedQuantity);
        var availableStock = totalStock - reservedStock;

        // Get historical movements for demand analysis
        var historicalDays = 90;
        var startDate = DateTime.UtcNow.AddDays(-historicalDays);

        var movementsQuery = _context.StockMovements
            .Where(m => m.ProductId == productId && m.MovementDate >= startDate);

        if (warehouseId.HasValue)
            movementsQuery = movementsQuery.Where(m => m.WarehouseId == warehouseId.Value);

        var movements = await movementsQuery
            .OrderBy(m => m.MovementDate)
            .ToListAsync(cancellationToken);

        // Calculate demand statistics
        var demandData = CalculateDailyDemand(movements, startDate, historicalDays);
        var avgDailyDemand = demandData.Count > 0 ? demandData.Average(d => d.Demand) : 0;
        var stdDev = CalculateStandardDeviation(demandData.Select(d => d.Demand).ToList());

        // Generate forecast
        var dailyForecasts = GenerateForecast(demandData, forecastDays, method);
        var totalForecastedDemand = dailyForecasts.Sum(f => f.ForecastedDemand);

        // Calculate days until stockout
        var daysUntilStockout = avgDailyDemand > 0
            ? (int)(availableStock / avgDailyDemand)
            : int.MaxValue;

        var expectedStockoutDate = daysUntilStockout < int.MaxValue
            ? DateTime.UtcNow.AddDays(daysUntilStockout)
            : (DateTime?)null;

        // Determine if reorder is needed
        var leadTimeDays = product.LeadTimeDays > 0 ? product.LeadTimeDays : 7;
        var reorderLevel = avgDailyDemand * leadTimeDays * 1.5m;
        var needsReorder = availableStock <= reorderLevel || daysUntilStockout <= leadTimeDays;

        var suggestedReorderQty = needsReorder
            ? Math.Max(product.ReorderQuantity > 0 ? product.ReorderQuantity : (avgDailyDemand * 30), totalForecastedDemand - availableStock + (avgDailyDemand * leadTimeDays))
            : 0;

        return new ProductForecastDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            CategoryName = product.Category?.Name,
            CurrentStock = totalStock,
            AvailableStock = availableStock,
            ReservedStock = reservedStock,
            MinStockLevel = 0,
            ReorderLevel = reorderLevel,
            ReorderQuantity = product.ReorderQuantity,
            LeadTimeDays = leadTimeDays,
            AverageDailyDemand = avgDailyDemand,
            DemandStandardDeviation = stdDev,
            SeasonalityFactor = 1.0m, // Simplified for now
            TrendDirection = CalculateTrend(demandData),
            MethodUsed = method,
            ForecastAccuracy = CalculateForecastAccuracy(demandData, method),
            EstimatedDaysUntilStockout = daysUntilStockout,
            ExpectedStockoutDate = expectedStockoutDate,
            TotalForecastedDemand = totalForecastedDemand,
            DailyForecasts = dailyForecasts,
            NeedsReorder = needsReorder,
            SuggestedReorderQuantity = suggestedReorderQty,
            SuggestedOrderDate = needsReorder ? DateTime.UtcNow.AddDays(Math.Max(0, daysUntilStockout - leadTimeDays)) : null,
            ReorderReason = needsReorder
                ? (daysUntilStockout <= leadTimeDays
                    ? "Stok tükenme riski lead time içinde"
                    : "Stok seviyesi reorder seviyesinin altında")
                : null
        };
    }

    public async Task<List<ProductForecastDto>> GetProductForecastsAsync(
        StockForecastFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsQueryable();

        if (filter.ProductId.HasValue)
            query = query.Where(p => p.Id == filter.ProductId.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);

        var products = await query.Take(100).ToListAsync(cancellationToken);
        var forecasts = new List<ProductForecastDto>();

        foreach (var product in products)
        {
            var forecast = await GetProductForecastAsync(
                product.Id,
                filter.WarehouseId,
                filter.ForecastDays,
                filter.Method,
                cancellationToken);

            if (forecast != null)
                forecasts.Add(forecast);
        }

        return forecasts;
    }

    public async Task<ForecastSummaryDto> GetForecastSummaryAsync(
        StockForecastFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var forecasts = await GetProductForecastsAsync(filter, cancellationToken);

        var productsNeedingReorder = forecasts.Where(f => f.NeedsReorder).ToList();
        var productsAtRisk = forecasts.Where(f => f.EstimatedDaysUntilStockout <= f.LeadTimeDays).ToList();
        var productsInStockout = forecasts.Where(f => f.AvailableStock <= 0).ToList();

        // Calculate risk distribution
        var highRisk = forecasts.Count(f => f.EstimatedDaysUntilStockout < f.LeadTimeDays);
        var mediumRisk = forecasts.Count(f => f.EstimatedDaysUntilStockout >= f.LeadTimeDays &&
                                              f.EstimatedDaysUntilStockout < f.LeadTimeDays * 2);
        var lowRisk = forecasts.Count(f => f.EstimatedDaysUntilStockout >= f.LeadTimeDays * 2);

        // Group by category
        var byCategory = forecasts
            .Where(f => f.CategoryName != null)
            .GroupBy(f => new { f.CategoryName })
            .Select(g => new CategoryForecastSummaryDto
            {
                CategoryId = 0, // Would need to be looked up
                CategoryName = g.Key.CategoryName!,
                ProductCount = g.Count(),
                ProductsNeedingReorder = g.Count(f => f.NeedsReorder),
                TotalForecastedDemand = g.Sum(f => f.TotalForecastedDemand),
                TotalSuggestedReorderValue = g.Sum(f => f.SuggestedReorderQuantity)
            })
            .ToList();

        return new ForecastSummaryDto
        {
            GeneratedAt = DateTime.UtcNow,
            ForecastPeriodDays = filter.ForecastDays,
            MethodUsed = filter.Method,
            TotalProductsAnalyzed = forecasts.Count,
            ProductsNeedingReorder = productsNeedingReorder.Count,
            ProductsAtRisk = productsAtRisk.Count,
            ProductsInStockout = productsInStockout.Count,
            TotalForecastedDemandValue = forecasts.Sum(f => f.TotalForecastedDemand),
            TotalSuggestedReorderValue = productsNeedingReorder.Sum(f => f.SuggestedReorderQuantity),
            HighRiskProducts = highRisk,
            MediumRiskProducts = mediumRisk,
            LowRiskProducts = lowRisk,
            ByCategory = byCategory,
            TopReorderProducts = productsNeedingReorder
                .OrderByDescending(f => f.SuggestedReorderQuantity)
                .Take(10)
                .ToList()
        };
    }

    public async Task<DemandAnalysisDto?> GetDemandAnalysisAsync(
        int productId,
        int? warehouseId = null,
        int analysisDays = 90,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        var startDate = DateTime.UtcNow.AddDays(-analysisDays);

        var movementsQuery = _context.StockMovements
            .Where(m => m.ProductId == productId && m.MovementDate >= startDate);

        if (warehouseId.HasValue)
            movementsQuery = movementsQuery.Where(m => m.WarehouseId == warehouseId.Value);

        var movements = await movementsQuery
            .OrderBy(m => m.MovementDate)
            .ToListAsync(cancellationToken);

        var demandData = CalculateDailyDemand(movements, startDate, analysisDays);
        var demands = demandData.Select(d => d.Demand).ToList();

        var totalDemand = demands.Sum();
        var avgDemand = demands.Count > 0 ? demands.Average() : 0;
        var medianDemand = demands.Count > 0 ? GetMedian(demands) : 0;
        var maxDemand = demands.Count > 0 ? demands.Max() : 0;
        var minDemand = demands.Count > 0 ? demands.Min() : 0;
        var stdDev = CalculateStandardDeviation(demands);
        var cv = avgDemand > 0 ? stdDev / avgDemand : 0;

        // Calculate trend
        var trend = CalculateTrend(demandData);
        var trendDirection = trend > 0.05m ? "Increasing" : (trend < -0.05m ? "Decreasing" : "Stable");
        var trendPercentage = trend * 100;

        // Calculate ABC classification based on revenue contribution (simplified)
        var abcClass = totalDemand > 1000 ? "A" : (totalDemand > 100 ? "B" : "C");

        // Detect outliers using IQR method
        var q1 = GetPercentile(demands, 25);
        var q3 = GetPercentile(demands, 75);
        var iqr = q3 - q1;
        var lowerBound = q1 - 1.5m * iqr;
        var upperBound = q3 + 1.5m * iqr;

        var dailyDemandDtos = demandData.Select(d => new DailyDemandDto
        {
            Date = d.Date,
            Demand = d.Demand,
            IsOutlier = d.Demand < lowerBound || d.Demand > upperBound
        }).ToList();

        return new DemandAnalysisDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            AnalysisPeriodDays = analysisDays,
            TotalDemand = totalDemand,
            AverageDailyDemand = avgDemand,
            MedianDailyDemand = medianDemand,
            MaxDailyDemand = maxDemand,
            MinDailyDemand = minDemand,
            StandardDeviation = stdDev,
            CoefficientOfVariation = cv,
            TrendDirection = trendDirection,
            TrendPercentage = trendPercentage,
            HasSeasonality = false, // Simplified for now
            SeasonalPatterns = null,
            ABCClass = abcClass,
            RevenueContribution = totalDemand, // Simplified
            DailyDemand = dailyDemandDtos
        };
    }

    public async Task<SafetyStockCalculationDto?> GetSafetyStockCalculationAsync(
        int productId,
        decimal serviceLevel = 0.95m,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        // Get demand analysis
        var demandAnalysis = await GetDemandAnalysisAsync(productId, null, 90, cancellationToken);
        if (demandAnalysis == null)
            return null;

        var avgDailyDemand = demandAnalysis.AverageDailyDemand;
        var stdDev = demandAnalysis.StandardDeviation;
        var leadTimeDays = product.LeadTimeDays > 0 ? product.LeadTimeDays : 7;
        var leadTimeVariation = 1; // Simplified

        // Z-score for service level (95% = 1.65, 99% = 2.33)
        var zScore = GetZScore(serviceLevel);

        // Safety Stock = Z * sqrt(LT * σd² + d² * σLT²)
        // Simplified: Safety Stock = Z * σd * sqrt(LT)
        var recommendedSafetyStock = zScore * stdDev * (decimal)Math.Sqrt((double)leadTimeDays);

        // Reorder Point = (Average Daily Demand × Lead Time) + Safety Stock
        var recommendedReorderPoint = (avgDailyDemand * leadTimeDays) + recommendedSafetyStock;

        // Economic Order Quantity (EOQ) = sqrt(2DS/H)
        // Simplified: EOQ = sqrt(2 * Annual Demand * Order Cost / Holding Cost)
        var annualDemand = avgDailyDemand * 365;
        var orderCost = 50m; // Simplified fixed order cost
        var holdingCost = (product.UnitPrice.Amount) * 0.25m; // 25% of unit cost
        var eoq = holdingCost > 0
            ? (decimal)Math.Sqrt((double)(2 * annualDemand * orderCost / holdingCost))
            : avgDailyDemand * 30;

        return new SafetyStockCalculationDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            AverageDailyDemand = avgDailyDemand,
            DemandStandardDeviation = stdDev,
            LeadTimeDays = leadTimeDays,
            LeadTimeVariationDays = leadTimeVariation,
            ServiceLevel = serviceLevel,
            CurrentSafetyStock = product.MinimumStock,
            RecommendedSafetyStock = Math.Round(recommendedSafetyStock, 2),
            RecommendedReorderPoint = Math.Round(recommendedReorderPoint, 2),
            EconomicOrderQuantity = Math.Round(eoq, 2),
            CalculationMethod = "Statistical Safety Stock with Service Level",
            Formula = $"SS = Z({zScore:F2}) × σ({stdDev:F2}) × √LT({leadTimeDays}) = {recommendedSafetyStock:F2}"
        };
    }

    public async Task<StockOptimizationDto?> GetStockOptimizationAsync(
        int productId,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        var safetyCalc = await GetSafetyStockCalculationAsync(productId, 0.95m, cancellationToken);
        if (safetyCalc == null)
            return null;

        var currentMinStock = product.MinimumStock;
        var currentMaxStock = product.MaximumStock;
        var currentReorderLevel = product.ReorderPoint;
        var currentReorderQty = product.ReorderQuantity;

        var recommendedMinStock = safetyCalc.RecommendedSafetyStock;
        var recommendedReorderLevel = safetyCalc.RecommendedReorderPoint;
        var recommendedReorderQty = safetyCalc.EconomicOrderQuantity;
        var recommendedMaxStock = recommendedReorderLevel + recommendedReorderQty;

        var currentAvgInventory = currentMinStock + (currentReorderQty / 2);
        var recommendedAvgInventory = recommendedMinStock + (recommendedReorderQty / 2);
        var inventoryReduction = currentAvgInventory > 0
            ? ((currentAvgInventory - recommendedAvgInventory) / currentAvgInventory) * 100
            : 0;

        var recommendations = new List<string>();

        if (currentMinStock < recommendedMinStock * 0.8m)
            recommendations.Add($"Minimum stok seviyesini {recommendedMinStock:F0} olarak artırın");
        else if (currentMinStock > recommendedMinStock * 1.2m)
            recommendations.Add($"Minimum stok seviyesini {recommendedMinStock:F0} olarak azaltın");

        if (currentReorderLevel < recommendedReorderLevel * 0.8m)
            recommendations.Add($"Yeniden sipariş seviyesini {recommendedReorderLevel:F0} olarak artırın");
        else if (currentReorderLevel > recommendedReorderLevel * 1.2m)
            recommendations.Add($"Yeniden sipariş seviyesini {recommendedReorderLevel:F0} olarak azaltın");

        if (currentReorderQty < recommendedReorderQty * 0.7m)
            recommendations.Add($"Sipariş miktarını {recommendedReorderQty:F0} olarak artırın (EOQ bazlı)");
        else if (currentReorderQty > recommendedReorderQty * 1.3m)
            recommendations.Add($"Sipariş miktarını {recommendedReorderQty:F0} olarak azaltın (EOQ bazlı)");

        if (recommendations.Count == 0)
            recommendations.Add("Mevcut stok parametreleri optimal seviyede");

        return new StockOptimizationDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            CurrentMinStock = currentMinStock,
            CurrentMaxStock = currentMaxStock,
            CurrentReorderLevel = currentReorderLevel,
            CurrentReorderQuantity = currentReorderQty,
            RecommendedMinStock = Math.Round(recommendedMinStock, 0),
            RecommendedMaxStock = Math.Round(recommendedMaxStock, 0),
            RecommendedReorderLevel = Math.Round(recommendedReorderLevel, 0),
            RecommendedReorderQuantity = Math.Round(recommendedReorderQty, 0),
            RecommendedSafetyStock = Math.Round(safetyCalc.RecommendedSafetyStock, 0),
            CurrentAverageInventory = currentAvgInventory,
            RecommendedAverageInventory = recommendedAvgInventory,
            InventoryReductionPercent = Math.Round(inventoryReduction, 1),
            CurrentServiceLevel = 0.90m, // Estimated
            RecommendedServiceLevel = 0.95m,
            EstimatedAnnualSavings = Math.Max(0, (currentAvgInventory - recommendedAvgInventory) * product.UnitPrice.Amount * 0.25m),
            Recommendations = recommendations
        };
    }

    public async Task<List<StockOptimizationDto>> GetBulkStockOptimizationsAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query.Take(50).ToListAsync(cancellationToken);
        var optimizations = new List<StockOptimizationDto>();

        foreach (var product in products)
        {
            var optimization = await GetStockOptimizationAsync(product.Id, cancellationToken);
            if (optimization != null)
                optimizations.Add(optimization);
        }

        return optimizations;
    }

    // =====================================
    // REORDER RULE OPERATIONS
    // =====================================

    public Task<List<ReorderRuleDto>> GetReorderRulesAsync(
        int? productId = null,
        int? categoryId = null,
        int? warehouseId = null,
        ReorderRuleStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        // In a real implementation, this would query a ReorderRules table
        // For now, return empty list as the entity doesn't exist yet
        return Task.FromResult(new List<ReorderRuleDto>());
    }

    public Task<ReorderRuleDto?> GetReorderRuleByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult<ReorderRuleDto?>(null);
    }

    public Task<ReorderRuleDto> CreateReorderRuleAsync(
        CreateReorderRuleDto dto,
        CancellationToken cancellationToken = default)
    {
        // Placeholder - would create entity in database
        return Task.FromResult(new ReorderRuleDto
        {
            Id = 1,
            Name = dto.Name,
            Description = dto.Description,
            ProductId = dto.ProductId,
            CategoryId = dto.CategoryId,
            WarehouseId = dto.WarehouseId,
            SupplierId = dto.SupplierId,
            TriggerBelowQuantity = dto.TriggerBelowQuantity,
            TriggerBelowDaysOfStock = dto.TriggerBelowDaysOfStock,
            TriggerOnForecast = dto.TriggerOnForecast,
            ForecastLeadTimeDays = dto.ForecastLeadTimeDays,
            FixedReorderQuantity = dto.FixedReorderQuantity,
            ReorderUpToQuantity = dto.ReorderUpToQuantity,
            UseEconomicOrderQuantity = dto.UseEconomicOrderQuantity,
            MinimumOrderQuantity = dto.MinimumOrderQuantity,
            MaximumOrderQuantity = dto.MaximumOrderQuantity,
            RoundToPackSize = dto.RoundToPackSize,
            PackSize = dto.PackSize,
            IsScheduled = dto.IsScheduled,
            CronExpression = dto.CronExpression,
            RequiresApproval = dto.RequiresApproval,
            ApproverUserId = dto.ApproverUserId,
            Status = ReorderRuleStatus.Active,
            CreatedAt = DateTime.UtcNow
        });
    }

    public Task<ReorderRuleDto?> UpdateReorderRuleAsync(
        int id,
        CreateReorderRuleDto dto,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult<ReorderRuleDto?>(null);
    }

    public Task<bool> DeleteReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(false);
    }

    public Task<bool> ActivateReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(false);
    }

    public Task<bool> PauseReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(false);
    }

    public Task<bool> DisableReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(false);
    }

    public Task<List<ReorderSuggestionDto>> ExecuteReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new List<ReorderSuggestionDto>());
    }

    // =====================================
    // REORDER SUGGESTION OPERATIONS
    // =====================================

    public async Task<PaginatedReorderSuggestionsDto> GetReorderSuggestionsAsync(
        ReorderSuggestionFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        // Generate suggestions on-the-fly based on current stock levels
        var suggestions = await GenerateReorderSuggestionsAsync(
            filter.CategoryId,
            filter.WarehouseId,
            cancellationToken);

        // Apply filters
        if (filter.ProductId.HasValue)
            suggestions = suggestions.Where(s => s.ProductId == filter.ProductId.Value).ToList();

        if (filter.SupplierId.HasValue)
            suggestions = suggestions.Where(s => s.SuggestedSupplierId == filter.SupplierId.Value).ToList();

        if (filter.Status.HasValue)
            suggestions = suggestions.Where(s => s.Status == filter.Status.Value).ToList();

        var totalCount = suggestions.Count;
        var paged = suggestions
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return new PaginatedReorderSuggestionsDto
        {
            Items = paged,
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize),
            HasNextPage = filter.PageNumber * filter.PageSize < totalCount,
            HasPreviousPage = filter.PageNumber > 1,
            PendingCount = suggestions.Count(s => s.Status == ReorderSuggestionStatus.Pending),
            ApprovedCount = suggestions.Count(s => s.Status == ReorderSuggestionStatus.Approved),
            TotalPendingValue = suggestions.Where(s => s.Status == ReorderSuggestionStatus.Pending).Sum(s => s.EstimatedCost)
        };
    }

    public Task<ReorderSuggestionDto?> GetReorderSuggestionByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult<ReorderSuggestionDto?>(null);
    }

    public async Task<List<ReorderSuggestionDto>> GenerateReorderSuggestionsAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var filter = new StockForecastFilterDto
        {
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            ForecastDays = 30
        };

        var forecasts = await GetProductForecastsAsync(filter, cancellationToken);
        var suggestions = new List<ReorderSuggestionDto>();
        var suggestionId = 1;

        foreach (var forecast in forecasts.Where(f => f.NeedsReorder))
        {
            suggestions.Add(new ReorderSuggestionDto
            {
                Id = suggestionId++,
                GeneratedAt = DateTime.UtcNow,
                ProductId = forecast.ProductId,
                ProductCode = forecast.ProductCode,
                ProductName = forecast.ProductName,
                CategoryName = forecast.CategoryName,
                WarehouseId = warehouseId,
                CurrentStock = forecast.CurrentStock,
                AvailableStock = forecast.AvailableStock,
                MinStockLevel = forecast.MinStockLevel,
                ReorderLevel = forecast.ReorderLevel,
                SuggestedQuantity = forecast.SuggestedReorderQuantity,
                EstimatedCost = forecast.SuggestedReorderQuantity * 10, // Simplified cost calculation
                Currency = "TRY",
                TriggerReason = forecast.ReorderReason,
                EstimatedDaysUntilStockout = forecast.EstimatedDaysUntilStockout,
                ExpectedStockoutDate = forecast.ExpectedStockoutDate,
                Status = ReorderSuggestionStatus.Pending,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsExpired = false
            });
        }

        return suggestions;
    }

    public Task<ReorderSuggestionDto?> ProcessReorderSuggestionAsync(
        int id,
        ProcessReorderSuggestionDto dto,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult<ReorderSuggestionDto?>(null);
    }

    public Task<int> BulkProcessReorderSuggestionsAsync(
        List<int> ids,
        ProcessReorderSuggestionDto dto,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(0);
    }

    public Task<int> ExpireOldSuggestionsAsync(
        int daysOld = 7,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(0);
    }

    // =====================================
    // ANALYSIS & REPORTING
    // =====================================

    public async Task<Dictionary<string, List<int>>> GetAbcClassificationAsync(
        int? categoryId = null,
        int analysisDays = 365,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query.ToListAsync(cancellationToken);
        var productDemands = new List<(int ProductId, decimal TotalDemand)>();

        foreach (var product in products)
        {
            var analysis = await GetDemandAnalysisAsync(product.Id, null, analysisDays, cancellationToken);
            if (analysis != null)
                productDemands.Add((product.Id, analysis.TotalDemand));
        }

        var sorted = productDemands.OrderByDescending(p => p.TotalDemand).ToList();
        var totalDemand = sorted.Sum(p => p.TotalDemand);
        var cumulativePercent = 0m;

        var classification = new Dictionary<string, List<int>>
        {
            { "A", new List<int>() },
            { "B", new List<int>() },
            { "C", new List<int>() }
        };

        foreach (var (productId, demand) in sorted)
        {
            cumulativePercent += totalDemand > 0 ? (demand / totalDemand) * 100 : 0;

            if (cumulativePercent <= 80)
                classification["A"].Add(productId);
            else if (cumulativePercent <= 95)
                classification["B"].Add(productId);
            else
                classification["C"].Add(productId);
        }

        return classification;
    }

    public async Task<List<ProductForecastDto>> GetStockoutRiskProductsAsync(
        int riskDays = 7,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var filter = new StockForecastFilterDto
        {
            WarehouseId = warehouseId,
            ForecastDays = riskDays * 2
        };

        var forecasts = await GetProductForecastsAsync(filter, cancellationToken);

        return forecasts
            .Where(f => f.EstimatedDaysUntilStockout <= riskDays)
            .OrderBy(f => f.EstimatedDaysUntilStockout)
            .ToList();
    }

    public Task<List<SeasonalPatternDto>> GetSeasonalPatternsAsync(
        int productId,
        CancellationToken cancellationToken = default)
    {
        // Simplified seasonal pattern analysis
        // In a real implementation, this would analyze historical data for patterns
        return Task.FromResult(new List<SeasonalPatternDto>());
    }

    // =====================================
    // HELPER METHODS
    // =====================================

    private List<(DateTime Date, decimal Demand)> CalculateDailyDemand(
        List<StockMovement> movements,
        DateTime startDate,
        int days)
    {
        var result = new List<(DateTime Date, decimal Demand)>();

        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i).Date;
            var dailyDemand = movements
                .Where(m => m.MovementDate.Date == date &&
                       (m.MovementType == StockMovementType.Sales ||
                        m.MovementType == StockMovementType.Consumption))
                .Sum(m => Math.Abs(m.Quantity));

            result.Add((date, (decimal)dailyDemand));
        }

        return result;
    }

    private decimal CalculateStandardDeviation(List<decimal> values)
    {
        if (values.Count == 0) return 0;

        var avg = values.Average();
        var sumOfSquares = values.Sum(v => (v - avg) * (v - avg));
        return (decimal)Math.Sqrt((double)(sumOfSquares / values.Count));
    }

    private decimal CalculateTrend(List<(DateTime Date, decimal Demand)> demandData)
    {
        if (demandData.Count < 2) return 0;

        // Simple linear regression slope
        var n = demandData.Count;
        var sumX = 0m;
        var sumY = demandData.Sum(d => d.Demand);
        var sumXY = 0m;
        var sumX2 = 0m;

        for (int i = 0; i < n; i++)
        {
            sumX += i;
            sumXY += i * demandData[i].Demand;
            sumX2 += i * i;
        }

        var denominator = n * sumX2 - sumX * sumX;
        if (denominator == 0) return 0;

        return (n * sumXY - sumX * sumY) / denominator;
    }

    private List<DailyForecastDto> GenerateForecast(
        List<(DateTime Date, decimal Demand)> historicalData,
        int forecastDays,
        ForecastingMethod method)
    {
        var forecasts = new List<DailyForecastDto>();
        var startDate = DateTime.UtcNow.Date;

        // Calculate baseline forecast based on method
        decimal baselineForecast;
        decimal stdDev = CalculateStandardDeviation(historicalData.Select(d => d.Demand).ToList());

        switch (method)
        {
            case ForecastingMethod.SimpleMovingAverage:
                var recentData = historicalData.TakeLast(7).Select(d => d.Demand).ToList();
                baselineForecast = recentData.Count > 0 ? recentData.Average() : 0;
                break;

            case ForecastingMethod.WeightedMovingAverage:
                var weights = new[] { 0.4m, 0.3m, 0.2m, 0.1m };
                var last4 = historicalData.TakeLast(4).Select(d => d.Demand).ToList();
                baselineForecast = 0;
                for (int i = 0; i < Math.Min(weights.Length, last4.Count); i++)
                {
                    baselineForecast += last4[last4.Count - 1 - i] * weights[i];
                }
                break;

            case ForecastingMethod.ExponentialSmoothing:
            default:
                var alpha = 0.3m;
                baselineForecast = historicalData.Count > 0 ? historicalData.Last().Demand : 0;
                foreach (var data in historicalData.TakeLast(14))
                {
                    baselineForecast = alpha * data.Demand + (1 - alpha) * baselineForecast;
                }
                break;

            case ForecastingMethod.LinearRegression:
                var trend = CalculateTrend(historicalData);
                var avgDemand = historicalData.Count > 0 ? historicalData.Average(d => d.Demand) : 0;
                baselineForecast = avgDemand + (trend * historicalData.Count);
                break;

            case ForecastingMethod.SeasonalDecomposition:
                // Simplified - just use average with some variation
                baselineForecast = historicalData.Count > 0 ? historicalData.Average(d => d.Demand) : 0;
                break;
        }

        // Generate daily forecasts
        for (int i = 0; i < forecastDays; i++)
        {
            var date = startDate.AddDays(i);
            var confidence = Math.Max(0.5m, 1m - (i * 0.02m)); // Confidence decreases over time
            var margin = stdDev * (1 + i * 0.1m); // Uncertainty increases over time

            forecasts.Add(new DailyForecastDto
            {
                Date = date,
                ForecastedDemand = Math.Max(0, baselineForecast),
                LowerBound = Math.Max(0, baselineForecast - margin),
                UpperBound = baselineForecast + margin,
                ConfidenceLevel = confidence
            });
        }

        return forecasts;
    }

    private decimal CalculateForecastAccuracy(
        List<(DateTime Date, decimal Demand)> demandData,
        ForecastingMethod method)
    {
        // Calculate MAPE (Mean Absolute Percentage Error)
        // Lower is better, 0.1 = 10% error
        if (demandData.Count < 14) return 0.2m; // Not enough data

        var avgDemand = demandData.Average(d => d.Demand);
        var cv = CalculateStandardDeviation(demandData.Select(d => d.Demand).ToList()) / (avgDemand == 0 ? 1 : avgDemand);

        // Estimate accuracy based on data variability and method
        var baseAccuracy = method switch
        {
            ForecastingMethod.ExponentialSmoothing => 0.85m,
            ForecastingMethod.WeightedMovingAverage => 0.80m,
            ForecastingMethod.SimpleMovingAverage => 0.75m,
            ForecastingMethod.LinearRegression => 0.82m,
            ForecastingMethod.SeasonalDecomposition => 0.88m,
            _ => 0.75m
        };

        return Math.Max(0.5m, baseAccuracy - (cv * 0.2m));
    }

    private decimal GetMedian(List<decimal> values)
    {
        if (values.Count == 0) return 0;

        var sorted = values.OrderBy(v => v).ToList();
        var mid = sorted.Count / 2;

        return sorted.Count % 2 == 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    private decimal GetPercentile(List<decimal> values, int percentile)
    {
        if (values.Count == 0) return 0;

        var sorted = values.OrderBy(v => v).ToList();
        var index = (percentile / 100.0) * (sorted.Count - 1);
        var lower = (int)Math.Floor(index);
        var upper = (int)Math.Ceiling(index);

        if (lower == upper) return sorted[lower];

        return sorted[lower] + (sorted[upper] - sorted[lower]) * ((decimal)index - lower);
    }

    private decimal GetZScore(decimal serviceLevel)
    {
        // Common Z-scores for service levels
        return serviceLevel switch
        {
            >= 0.99m => 2.33m,
            >= 0.98m => 2.05m,
            >= 0.97m => 1.88m,
            >= 0.96m => 1.75m,
            >= 0.95m => 1.65m,
            >= 0.90m => 1.28m,
            >= 0.85m => 1.04m,
            >= 0.80m => 0.84m,
            _ => 0.67m
        };
    }
}
