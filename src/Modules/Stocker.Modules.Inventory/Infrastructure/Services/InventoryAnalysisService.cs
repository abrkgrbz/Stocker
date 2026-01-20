using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of advanced inventory analysis service (ABC/XYZ, turnover, dead stock)
/// </summary>
public class InventoryAnalysisService : IInventoryAnalysisService
{
    private readonly InventoryDbContext _context;

    public InventoryAnalysisService(InventoryDbContext context)
    {
        _context = context;
    }

    // =====================================
    // ABC/XYZ ANALYSIS
    // =====================================

    public async Task<AbcXyzAnalysisSummaryDto> GetAbcXyzAnalysisAsync(
        AbcXyzAnalysisFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var startDate = DateTime.UtcNow.AddDays(-filter.AnalysisPeriodDays);

        // Get all products with their sales data
        var query = _context.Products.AsQueryable();

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);

        if (filter.BrandId.HasValue)
            query = query.Where(p => p.BrandId == filter.BrandId.Value);

        if (!filter.IncludeInactiveProducts)
            query = query.Where(p => p.IsActive);

        var products = await query
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Stocks)
            .ToListAsync(cancellationToken);

        // Calculate metrics for each product
        var productAnalyses = new List<ProductAbcXyzDto>();

        foreach (var product in products)
        {
            var analysis = await CalculateProductAbcXyzAsync(
                product.Id,
                filter.AnalysisPeriodDays,
                cancellationToken);

            if (analysis != null)
            {
                analysis.CategoryName = product.Category?.Name;
                analysis.BrandName = product.Brand?.Name;
                analysis.CurrentStock = product.Stocks?.Sum(s => s.Quantity) ?? 0;
                analysis.AvailableStock = product.Stocks?.Sum(s => s.Quantity - s.ReservedQuantity) ?? 0;
                analysis.StockValue = analysis.CurrentStock * product.UnitPrice.Amount;
                productAnalyses.Add(analysis);
            }
        }

        // Sort by revenue for ABC classification
        var sortedByRevenue = productAnalyses.OrderByDescending(p => p.TotalRevenue).ToList();
        var totalRevenue = sortedByRevenue.Sum(p => p.TotalRevenue);

        // Calculate cumulative percentages and assign ABC class
        decimal cumulativeRevenue = 0;
        foreach (var product in sortedByRevenue)
        {
            product.RevenuePercentage = totalRevenue > 0 ? (product.TotalRevenue / totalRevenue) * 100 : 0;
            cumulativeRevenue += product.TotalRevenue;
            product.CumulativeRevenuePercentage = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0;

            // Assign ABC class
            if (product.CumulativeRevenuePercentage <= filter.AbcAThreshold)
                product.AbcClass = AbcClass.A;
            else if (product.CumulativeRevenuePercentage <= filter.AbcBThreshold)
                product.AbcClass = AbcClass.B;
            else
                product.AbcClass = AbcClass.C;

            // Assign XYZ class based on CV
            if (product.CoefficientOfVariation < filter.XyzXThreshold)
                product.XyzClass = XyzClass.X;
            else if (product.CoefficientOfVariation < filter.XyzYThreshold)
                product.XyzClass = XyzClass.Y;
            else
                product.XyzClass = XyzClass.Z;

            // Assign combined class
            product.CombinedClass = GetCombinedClass(product.AbcClass, product.XyzClass);

            // Calculate estimated days of stock (cap at 9999 to avoid overflow display issues)
            product.EstimatedDaysOfStock = product.AverageDailyDemand > 0
                ? Math.Min(9999, (int)(product.AvailableStock / product.AverageDailyDemand))
                : 9999; // Use 9999 instead of int.MaxValue for display purposes

            // Set management strategy and recommendations
            SetManagementStrategy(product);
        }

        // Build summary
        var summary = new AbcXyzAnalysisSummaryDto
        {
            GeneratedAt = DateTime.UtcNow,
            AnalysisPeriodDays = filter.AnalysisPeriodDays,
            TotalProductsAnalyzed = productAnalyses.Count,
            TotalRevenue = totalRevenue,
            TotalStockValue = productAnalyses.Sum(p => p.StockValue),

            // ABC class summaries
            ClassA = BuildAbcClassSummary(productAnalyses, AbcClass.A, totalRevenue),
            ClassB = BuildAbcClassSummary(productAnalyses, AbcClass.B, totalRevenue),
            ClassC = BuildAbcClassSummary(productAnalyses, AbcClass.C, totalRevenue),

            // XYZ class summaries
            ClassX = BuildXyzClassSummary(productAnalyses, XyzClass.X),
            ClassY = BuildXyzClassSummary(productAnalyses, XyzClass.Y),
            ClassZ = BuildXyzClassSummary(productAnalyses, XyzClass.Z),

            // Matrix
            Matrix = BuildAbcXyzMatrix(productAnalyses, totalRevenue),

            // Top products
            TopAProducts = sortedByRevenue.Where(p => p.AbcClass == AbcClass.A).Take(10).ToList(),
            HighRiskProducts = productAnalyses
                .Where(p => p.XyzClass == XyzClass.Z && (p.AbcClass == AbcClass.A || p.AbcClass == AbcClass.B))
                .OrderByDescending(p => p.TotalRevenue)
                .Take(10)
                .ToList(),

            // Strategic recommendations
            StrategicRecommendations = GenerateStrategicRecommendations(productAnalyses)
        };

        // Calculate average turnover
        var turnoverRatios = productAnalyses
            .Where(p => p.StockValue > 0)
            .Select(p => p.TotalRevenue / p.StockValue)
            .ToList();
        summary.AverageInventoryTurnover = turnoverRatios.Count > 0 ? turnoverRatios.Average() : 0;

        return summary;
    }

    public async Task<ProductAbcXyzDto?> GetProductAbcXyzClassificationAsync(
        int productId,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        return await CalculateProductAbcXyzAsync(productId, analysisPeriodDays, cancellationToken);
    }

    public async Task<List<ProductAbcXyzDto>> GetProductsByClassAsync(
        AbcXyzClass combinedClass,
        AbcXyzAnalysisFilterDto? filter = null,
        CancellationToken cancellationToken = default)
    {
        filter ??= new AbcXyzAnalysisFilterDto();
        var analysis = await GetAbcXyzAnalysisAsync(filter, cancellationToken);

        // Get all products then filter by combined class
        var allProducts = new List<ProductAbcXyzDto>();
        allProducts.AddRange(analysis.TopAProducts);

        return allProducts.Where(p => p.CombinedClass == combinedClass).ToList();
    }

    public async Task<List<AbcXyzMatrixCellDto>> GetAbcXyzMatrixAsync(
        AbcXyzAnalysisFilterDto? filter = null,
        CancellationToken cancellationToken = default)
    {
        filter ??= new AbcXyzAnalysisFilterDto();
        var analysis = await GetAbcXyzAnalysisAsync(filter, cancellationToken);
        return analysis.Matrix;
    }

    // =====================================
    // INVENTORY TURNOVER ANALYSIS
    // =====================================

    public async Task<List<InventoryTurnoverDto>> GetInventoryTurnoverAnalysisAsync(
        int? categoryId = null,
        int? warehouseId = null,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query
            .Include(p => p.Category)
            .Include(p => p.Stocks)
            .ToListAsync(cancellationToken);

        var results = new List<InventoryTurnoverDto>();

        foreach (var product in products)
        {
            var turnover = await GetProductTurnoverAsync(product.Id, analysisPeriodDays, cancellationToken);
            if (turnover != null)
                results.Add(turnover);
        }

        return results.OrderBy(t => t.InventoryTurnoverRatio).ToList();
    }

    public async Task<InventoryTurnoverDto?> GetProductTurnoverAsync(
        int productId,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Stocks)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        var startDate = DateTime.UtcNow.AddDays(-analysisPeriodDays);

        // Get COGS from sales movements
        var salesMovements = await _context.StockMovements
            .Where(m => m.ProductId == productId &&
                       m.MovementDate >= startDate &&
                       m.MovementType == StockMovementType.Sales)
            .ToListAsync(cancellationToken);

        var cogs = salesMovements.Sum(m => Math.Abs(m.Quantity) * (product.CostPrice?.Amount ?? product.UnitPrice.Amount));

        // Calculate average inventory value
        var currentStock = product.Stocks?.Sum(s => s.Quantity) ?? 0;
        var averageInventoryValue = currentStock * (product.CostPrice?.Amount ?? product.UnitPrice.Amount);

        // Calculate turnover ratio
        var turnoverRatio = averageInventoryValue > 0 ? cogs / averageInventoryValue : 0;
        var daysOfInventory = turnoverRatio > 0 ? (int)(365 / turnoverRatio) : 999;

        // Determine category
        var turnoverCategory = turnoverRatio switch
        {
            >= 12 => "Fast",
            >= 6 => "Medium",
            >= 2 => "Slow",
            _ => "Dead"
        };

        // Industry benchmark (simplified)
        var benchmark = 8m; // Average turns per year

        return new InventoryTurnoverDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            CategoryName = product.Category?.Name,
            CostOfGoodsSold = cogs,
            AverageInventoryValue = averageInventoryValue,
            InventoryTurnoverRatio = turnoverRatio,
            DaysOfInventory = daysOfInventory,
            TurnoverCategory = turnoverCategory,
            IndustryBenchmark = benchmark,
            PerformanceVsBenchmark = benchmark > 0 ? ((turnoverRatio - benchmark) / benchmark) * 100 : 0,
            CurrentStock = currentStock,
            StockValue = averageInventoryValue,
            IsOverstocked = daysOfInventory > 90,
            IsUnderstocked = daysOfInventory < 7 && currentStock > 0,
            OptimalStockLevel = (cogs / 365) * 30 // 30 days of stock
        };
    }

    public async Task<List<InventoryTurnoverDto>> GetSlowMovingInventoryAsync(
        int daysThreshold = 90,
        int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var turnovers = await GetInventoryTurnoverAnalysisAsync(categoryId, null, 365, cancellationToken);
        return turnovers.Where(t => t.DaysOfInventory > daysThreshold).ToList();
    }

    // =====================================
    // DEAD STOCK ANALYSIS
    // =====================================

    public async Task<DeadStockAnalysisDto> GetDeadStockAnalysisAsync(
        int noMovementDays = 90,
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-noMovementDays);

        var query = _context.Products.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query
            .Include(p => p.Category)
            .Include(p => p.Stocks)
            .ToListAsync(cancellationToken);

        var deadStockItems = new List<DeadStockItemDto>();
        decimal totalInventoryValue = 0;

        foreach (var product in products)
        {
            var currentStock = product.Stocks?.Sum(s => s.Quantity) ?? 0;
            if (currentStock <= 0) continue;

            var stockValue = currentStock * product.UnitPrice.Amount;
            totalInventoryValue += stockValue;

            // Get last movement date
            var lastMovement = await _context.StockMovements
                .Where(m => m.ProductId == product.Id)
                .OrderByDescending(m => m.MovementDate)
                .FirstOrDefaultAsync(cancellationToken);

            var lastSale = await _context.StockMovements
                .Where(m => m.ProductId == product.Id && m.MovementType == StockMovementType.Sales)
                .OrderByDescending(m => m.MovementDate)
                .FirstOrDefaultAsync(cancellationToken);

            var daysSinceLastMovement = lastMovement != null
                ? (int)(DateTime.UtcNow - lastMovement.MovementDate).TotalDays
                : 999;

            var daysSinceLastSale = lastSale != null
                ? (int)(DateTime.UtcNow - lastSale.MovementDate).TotalDays
                : 999;

            if (daysSinceLastMovement >= noMovementDays)
            {
                var agingCategory = daysSinceLastMovement switch
                {
                    < 60 => "30-60 gün",
                    < 90 => "60-90 gün",
                    < 180 => "90-180 gün",
                    _ => "180+ gün"
                };

                // Depreciation rate based on aging
                var depreciationRate = daysSinceLastMovement switch
                {
                    < 60 => 0.1m,
                    < 90 => 0.2m,
                    < 180 => 0.4m,
                    _ => 0.6m
                };

                deadStockItems.Add(new DeadStockItemDto
                {
                    ProductId = product.Id,
                    ProductCode = product.Code,
                    ProductName = product.Name,
                    CategoryName = product.Category?.Name,
                    CurrentStock = currentStock,
                    StockValue = stockValue,
                    DaysSinceLastSale = daysSinceLastSale,
                    DaysSinceLastMovement = daysSinceLastMovement,
                    LastSaleDate = lastSale?.MovementDate,
                    LastMovementDate = lastMovement?.MovementDate,
                    AgingCategory = agingCategory,
                    DepreciationRate = depreciationRate,
                    EstimatedRecoveryValue = stockValue * (1 - depreciationRate),
                    DisposalOptions = GenerateDisposalOptions(daysSinceLastMovement)
                });
            }
        }

        var totalDeadStockValue = deadStockItems.Sum(d => d.StockValue);

        return new DeadStockAnalysisDto
        {
            GeneratedAt = DateTime.UtcNow,
            AnalysisPeriodDays = noMovementDays,
            TotalDeadStockItems = deadStockItems.Count,
            TotalDeadStockValue = totalDeadStockValue,
            DeadStockPercentage = totalInventoryValue > 0 ? (totalDeadStockValue / totalInventoryValue) * 100 : 0,
            Items = deadStockItems.OrderByDescending(d => d.StockValue).ToList(),
            Recommendations = GenerateDeadStockRecommendations(deadStockItems),
            PotentialRecoveryValue = deadStockItems.Sum(d => d.EstimatedRecoveryValue)
        };
    }

    public async Task<Dictionary<string, List<DeadStockItemDto>>> GetInventoryAgingAnalysisAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var analysis = await GetDeadStockAnalysisAsync(30, categoryId, warehouseId, cancellationToken);

        return analysis.Items
            .GroupBy(i => i.AgingCategory)
            .ToDictionary(g => g.Key, g => g.ToList());
    }

    // =====================================
    // SERVICE LEVEL ANALYSIS
    // =====================================

    public async Task<List<ServiceLevelAnalysisDto>> GetServiceLevelAnalysisAsync(
        int? categoryId = null,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var products = await query.ToListAsync(cancellationToken);
        var results = new List<ServiceLevelAnalysisDto>();

        foreach (var product in products)
        {
            var analysis = await GetProductServiceLevelAsync(product.Id, analysisPeriodDays, cancellationToken);
            if (analysis != null)
                results.Add(analysis);
        }

        return results.OrderBy(s => s.CurrentServiceLevel).ToList();
    }

    public async Task<ServiceLevelAnalysisDto?> GetProductServiceLevelAsync(
        int productId,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        var startDate = DateTime.UtcNow.AddDays(-analysisPeriodDays);

        // Get sales movements as proxy for orders
        var salesMovements = await _context.StockMovements
            .Where(m => m.ProductId == productId &&
                       m.MovementDate >= startDate &&
                       m.MovementType == StockMovementType.Sales)
            .ToListAsync(cancellationToken);

        var totalOrders = salesMovements.Count;

        // Simplified: assume all orders were fulfilled (would need order data for accurate analysis)
        var fulfilledOrders = totalOrders;
        var stockoutEvents = 0; // Would need stockout tracking

        var serviceLevel = totalOrders > 0 ? (decimal)fulfilledOrders / totalOrders * 100 : 100;

        return new ServiceLevelAnalysisDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            CurrentServiceLevel = serviceLevel,
            TargetServiceLevel = 95m,
            TotalOrders = totalOrders,
            FulfilledOrders = fulfilledOrders,
            StockoutEvents = stockoutEvents,
            AverageStockoutDuration = 0,
            EstimatedLostSales = 0,
            BackorderCost = 0,
            RecommendedSafetyStock = product.MinimumStock * 1.5m,
            AdditionalStockCost = 0,
            ExpectedServiceLevelImprovement = 0
        };
    }

    // =====================================
    // STRATEGIC RECOMMENDATIONS
    // =====================================

    public async Task<List<StrategicRecommendationDto>> GetStrategicRecommendationsAsync(
        int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var filter = new AbcXyzAnalysisFilterDto { CategoryId = categoryId };
        var abcXyzAnalysis = await GetAbcXyzAnalysisAsync(filter, cancellationToken);
        return abcXyzAnalysis.StrategicRecommendations;
    }

    public async Task<InventoryHealthScoreDto> GetInventoryHealthScoreAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var turnoverAnalysis = await GetInventoryTurnoverAnalysisAsync(categoryId, warehouseId, 365, cancellationToken);
        var deadStockAnalysis = await GetDeadStockAnalysisAsync(90, categoryId, warehouseId, cancellationToken);
        var serviceLevelAnalysis = await GetServiceLevelAnalysisAsync(categoryId, 365, cancellationToken);

        // Calculate component scores (0-100)
        var avgTurnover = turnoverAnalysis.Count > 0 ? turnoverAnalysis.Average(t => t.InventoryTurnoverRatio) : 0;
        var turnoverScore = Math.Min(100, (int)(avgTurnover * 10)); // 10 turns = 100 score

        var stockoutScore = 95; // Placeholder - would need actual stockout data

        var deadStockScore = 100 - (int)Math.Min(100, deadStockAnalysis.DeadStockPercentage * 5);

        var accuracyScore = 90; // Placeholder - would need count accuracy data

        var balanceScore = 85; // Placeholder - would need ABC balance analysis

        var overallScore = (turnoverScore + stockoutScore + deadStockScore + accuracyScore + balanceScore) / 5;

        var avgServiceLevel = serviceLevelAnalysis.Count > 0
            ? serviceLevelAnalysis.Average(s => s.CurrentServiceLevel)
            : 95m;

        var overstockCount = turnoverAnalysis.Count(t => t.IsOverstocked);
        var overstockPercentage = turnoverAnalysis.Count > 0
            ? (decimal)overstockCount / turnoverAnalysis.Count * 100
            : 0;

        var improvementAreas = new List<string>();
        if (turnoverScore < 70) improvementAreas.Add("Stok devir hızını artırın");
        if (deadStockScore < 70) improvementAreas.Add("Ölü stokları azaltın");
        if (overstockPercentage > 20) improvementAreas.Add("Aşırı stoklamayı önleyin");

        return new InventoryHealthScoreDto
        {
            GeneratedAt = DateTime.UtcNow,
            OverallScore = overallScore,
            TurnoverScore = turnoverScore,
            StockoutScore = stockoutScore,
            DeadStockScore = deadStockScore,
            AccuracyScore = accuracyScore,
            BalanceScore = balanceScore,
            AverageInventoryTurnover = avgTurnover,
            StockoutRate = 100 - avgServiceLevel,
            DeadStockPercentage = deadStockAnalysis.DeadStockPercentage,
            OverstockPercentage = overstockPercentage,
            ServiceLevel = avgServiceLevel,
            TurnoverTrend = "Stable",
            HealthTrend = overallScore >= 70 ? "Good" : (overallScore >= 50 ? "Moderate" : "Needs Improvement"),
            ImprovementAreas = improvementAreas,
            PotentialSavings = deadStockAnalysis.TotalDeadStockValue * 0.3m // 30% of dead stock value
        };
    }

    // =====================================
    // HELPER METHODS
    // =====================================

    private async Task<ProductAbcXyzDto?> CalculateProductAbcXyzAsync(
        int productId,
        int analysisPeriodDays,
        CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return null;

        var startDate = DateTime.UtcNow.AddDays(-analysisPeriodDays);

        // Get sales data
        var salesMovements = await _context.StockMovements
            .Where(m => m.ProductId == productId &&
                       m.MovementDate >= startDate &&
                       (m.MovementType == StockMovementType.Sales ||
                        m.MovementType == StockMovementType.Consumption))
            .ToListAsync(cancellationToken);

        var totalQuantity = salesMovements.Sum(m => Math.Abs(m.Quantity));
        var totalRevenue = totalQuantity * product.UnitPrice.Amount;

        // Calculate daily demand for XYZ analysis
        var dailyDemands = new List<decimal>();
        for (int i = 0; i < analysisPeriodDays; i++)
        {
            var date = startDate.AddDays(i).Date;
            var dailyDemand = salesMovements
                .Where(m => m.MovementDate.Date == date)
                .Sum(m => Math.Abs(m.Quantity));
            dailyDemands.Add(dailyDemand);
        }

        var avgDailyDemand = dailyDemands.Count > 0 ? dailyDemands.Average() : 0;
        var stdDev = CalculateStandardDeviation(dailyDemands);
        var cv = avgDailyDemand > 0 ? stdDev / avgDailyDemand : 0;
        var daysWithDemand = dailyDemands.Count(d => d > 0);

        return new ProductAbcXyzDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            TotalRevenue = totalRevenue,
            TotalQuantitySold = totalQuantity,
            AverageUnitPrice = product.UnitPrice.Amount,
            AverageDailyDemand = avgDailyDemand,
            DemandStandardDeviation = stdDev,
            CoefficientOfVariation = cv,
            DaysWithDemand = daysWithDemand,
            TotalDays = analysisPeriodDays,
            DemandFrequency = analysisPeriodDays > 0 ? (decimal)daysWithDemand / analysisPeriodDays * 100 : 0
        };
    }

    private static decimal CalculateStandardDeviation(List<decimal> values)
    {
        if (values.Count == 0) return 0;
        var avg = values.Average();
        var sumOfSquares = values.Sum(v => (v - avg) * (v - avg));
        return (decimal)Math.Sqrt((double)(sumOfSquares / values.Count));
    }

    private static AbcXyzClass GetCombinedClass(AbcClass abc, XyzClass xyz)
    {
        return (abc, xyz) switch
        {
            (AbcClass.A, XyzClass.X) => AbcXyzClass.AX,
            (AbcClass.A, XyzClass.Y) => AbcXyzClass.AY,
            (AbcClass.A, XyzClass.Z) => AbcXyzClass.AZ,
            (AbcClass.B, XyzClass.X) => AbcXyzClass.BX,
            (AbcClass.B, XyzClass.Y) => AbcXyzClass.BY,
            (AbcClass.B, XyzClass.Z) => AbcXyzClass.BZ,
            (AbcClass.C, XyzClass.X) => AbcXyzClass.CX,
            (AbcClass.C, XyzClass.Y) => AbcXyzClass.CY,
            (AbcClass.C, XyzClass.Z) => AbcXyzClass.CZ,
            _ => AbcXyzClass.CZ
        };
    }

    private static void SetManagementStrategy(ProductAbcXyzDto product)
    {
        (product.ManagementStrategy, product.Recommendations) = product.CombinedClass switch
        {
            AbcXyzClass.AX => ("Kritik - Sürekli İzleme", new List<string>
            {
                "JIT (tam zamanında) tedarik stratejisi uygulayın",
                "Güvenlik stoku düşük tutulabilir",
                "Otomatik yeniden sipariş kuralları oluşturun",
                "Tedarikçi ile güçlü ilişki kurun"
            }),
            AbcXyzClass.AY => ("Kritik - Dikkatli Planlama", new List<string>
            {
                "Orta düzey güvenlik stoku tutun",
                "Talep tahminini düzenli güncelleyin",
                "Mevsimsel kalıpları izleyin",
                "Alternatif tedarikçiler belirleyin"
            }),
            AbcXyzClass.AZ => ("Kritik - Yüksek Risk", new List<string>
            {
                "Yüksek güvenlik stoku tutun",
                "Düzensiz talebin nedenini araştırın",
                "Müşteri bazlı talep analizi yapın",
                "Stok tükenme riskini yakından izleyin"
            }),
            AbcXyzClass.BX => ("Önemli - Standart Yönetim", new List<string>
            {
                "Standart yeniden sipariş noktası kullanın",
                "Periyodik gözden geçirme yapın",
                "Makul güvenlik stoku tutun"
            }),
            AbcXyzClass.BY => ("Önemli - Dikkatli İzleme", new List<string>
            {
                "Talep değişkenliğini izleyin",
                "Güvenlik stokunu artırın",
                "Sipariş miktarlarını optimize edin"
            }),
            AbcXyzClass.BZ => ("Önemli - Risk Yönetimi", new List<string>
            {
                "Talep kalıplarını araştırın",
                "Stok seviyelerini düzenli gözden geçirin",
                "Alternatif ürünler değerlendirin"
            }),
            AbcXyzClass.CX => ("Düşük Öncelik - Basit Yönetim", new List<string>
            {
                "Minimum stok tutun",
                "Toplu sipariş verin",
                "Otomasyona bırakın"
            }),
            AbcXyzClass.CY => ("Düşük Öncelik - Periyodik Gözden Geçirme", new List<string>
            {
                "Düşük güvenlik stoku yeterli",
                "Üç aylık gözden geçirme yapın"
            }),
            AbcXyzClass.CZ => ("Düşük Öncelik - Değerlendirme Gerekli", new List<string>
            {
                "Ürünün devamlılığını değerlendirin",
                "Sipariş üzerine üretim düşünün",
                "Elimine etmeyi değerlendirin"
            }),
            _ => ("Belirsiz", new List<string> { "Manuel değerlendirme gerekli" })
        };
    }

    private static AbcClassSummaryDto BuildAbcClassSummary(
        List<ProductAbcXyzDto> products,
        AbcClass abcClass,
        decimal totalRevenue)
    {
        var classProducts = products.Where(p => p.AbcClass == abcClass).ToList();
        var classRevenue = classProducts.Sum(p => p.TotalRevenue);
        var classStockValue = classProducts.Sum(p => p.StockValue);
        var totalStockValue = products.Sum(p => p.StockValue);

        return new AbcClassSummaryDto
        {
            Class = abcClass,
            ProductCount = classProducts.Count,
            ProductPercentage = products.Count > 0 ? (decimal)classProducts.Count / products.Count * 100 : 0,
            TotalRevenue = classRevenue,
            RevenuePercentage = totalRevenue > 0 ? (classRevenue / totalRevenue) * 100 : 0,
            TotalStockValue = classStockValue,
            StockValuePercentage = totalStockValue > 0 ? (classStockValue / totalStockValue) * 100 : 0,
            AverageInventoryTurnover = classStockValue > 0 ? classRevenue / classStockValue : 0
        };
    }

    private static XyzClassSummaryDto BuildXyzClassSummary(List<ProductAbcXyzDto> products, XyzClass xyzClass)
    {
        var classProducts = products.Where(p => p.XyzClass == xyzClass).ToList();

        return new XyzClassSummaryDto
        {
            Class = xyzClass,
            ProductCount = classProducts.Count,
            ProductPercentage = products.Count > 0 ? (decimal)classProducts.Count / products.Count * 100 : 0,
            AverageCoefficientOfVariation = classProducts.Count > 0 ? classProducts.Average(p => p.CoefficientOfVariation) : 0,
            AverageDemandFrequency = classProducts.Count > 0 ? classProducts.Average(p => p.DemandFrequency) : 0,
            DemandPattern = xyzClass switch
            {
                XyzClass.X => "Sabit",
                XyzClass.Y => "Değişken",
                XyzClass.Z => "Düzensiz",
                _ => "Bilinmiyor"
            }
        };
    }

    private static List<AbcXyzMatrixCellDto> BuildAbcXyzMatrix(List<ProductAbcXyzDto> products, decimal totalRevenue)
    {
        var matrix = new List<AbcXyzMatrixCellDto>();

        foreach (AbcXyzClass combinedClass in Enum.GetValues<AbcXyzClass>())
        {
            var cellProducts = products.Where(p => p.CombinedClass == combinedClass).ToList();
            var cellRevenue = cellProducts.Sum(p => p.TotalRevenue);
            var cellStockValue = cellProducts.Sum(p => p.StockValue);

            var priority = combinedClass switch
            {
                AbcXyzClass.AX or AbcXyzClass.AY => "Kritik",
                AbcXyzClass.AZ or AbcXyzClass.BX => "Yüksek",
                AbcXyzClass.BY or AbcXyzClass.BZ => "Orta",
                _ => "Düşük"
            };

            var strategy = combinedClass switch
            {
                AbcXyzClass.AX => "JIT tedarik, düşük güvenlik stoku",
                AbcXyzClass.AY => "Talep tahmini, orta güvenlik stoku",
                AbcXyzClass.AZ => "Yüksek güvenlik stoku, risk yönetimi",
                AbcXyzClass.BX => "Standart yönetim, otomasyon",
                AbcXyzClass.BY => "Periyodik gözden geçirme",
                AbcXyzClass.BZ => "Talep analizi, değerlendirme",
                AbcXyzClass.CX => "Minimum stok, toplu sipariş",
                AbcXyzClass.CY => "Düşük öncelik, basit yönetim",
                AbcXyzClass.CZ => "Elimine etmeyi değerlendir",
                _ => "Manuel değerlendirme"
            };

            matrix.Add(new AbcXyzMatrixCellDto
            {
                CombinedClass = combinedClass,
                ProductCount = cellProducts.Count,
                ProductPercentage = products.Count > 0 ? (decimal)cellProducts.Count / products.Count * 100 : 0,
                TotalRevenue = cellRevenue,
                RevenuePercentage = totalRevenue > 0 ? (cellRevenue / totalRevenue) * 100 : 0,
                TotalStockValue = cellStockValue,
                ManagementPriority = priority,
                RecommendedStrategy = strategy
            });
        }

        return matrix;
    }

    private static List<StrategicRecommendationDto> GenerateStrategicRecommendations(List<ProductAbcXyzDto> products)
    {
        var recommendations = new List<StrategicRecommendationDto>();

        // AZ products - high value, unpredictable
        var azProducts = products.Where(p => p.CombinedClass == AbcXyzClass.AZ).ToList();
        if (azProducts.Count > 0)
        {
            recommendations.Add(new StrategicRecommendationDto
            {
                Category = "Risk Yönetimi",
                Priority = "Yüksek",
                Recommendation = $"{azProducts.Count} adet yüksek değerli ancak düzensiz talebe sahip ürün tespit edildi. Bu ürünler için güvenlik stoklarını artırın.",
                Impact = "Stok tükenme riskini azaltır, müşteri memnuniyetini korur",
                AffectedProductIds = azProducts.Select(p => p.ProductId).ToList(),
                EstimatedSavings = azProducts.Sum(p => p.TotalRevenue) * 0.05m // 5% of lost sales prevention
            });
        }

        // C class products with high stock
        var overstockedC = products.Where(p => p.AbcClass == AbcClass.C && p.EstimatedDaysOfStock > 180).ToList();
        if (overstockedC.Count > 0)
        {
            recommendations.Add(new StrategicRecommendationDto
            {
                Category = "Stok Optimizasyonu",
                Priority = "Orta",
                Recommendation = $"{overstockedC.Count} adet düşük değerli ürün aşırı stoklanmış. Bu ürünlerin stok seviyelerini azaltın veya promosyonlarla eritin.",
                Impact = "Sermaye serbest bırakılır, depo alanı optimize edilir",
                AffectedProductIds = overstockedC.Select(p => p.ProductId).ToList(),
                EstimatedSavings = overstockedC.Sum(p => p.StockValue) * 0.2m // 20% of holding cost
            });
        }

        // A class products with low stock
        var understockedA = products.Where(p => p.AbcClass == AbcClass.A && p.EstimatedDaysOfStock < 14).ToList();
        if (understockedA.Count > 0)
        {
            recommendations.Add(new StrategicRecommendationDto
            {
                Category = "Tedarik Zinciri",
                Priority = "Yüksek",
                Recommendation = $"{understockedA.Count} adet yüksek değerli ürün için stok kritik seviyede. Acil sipariş verin.",
                Impact = "Satış kaybını önler, müşteri güvenini korur",
                AffectedProductIds = understockedA.Select(p => p.ProductId).ToList(),
                EstimatedSavings = understockedA.Sum(p => p.AverageDailyDemand * 14 * p.AverageUnitPrice) * 0.1m
            });
        }

        return recommendations;
    }

    private static List<string> GenerateDisposalOptions(int daysSinceLastMovement)
    {
        var options = new List<string>();

        if (daysSinceLastMovement < 90)
        {
            options.Add("Promosyon/indirim kampanyası");
            options.Add("Paket satış");
        }

        if (daysSinceLastMovement >= 90 && daysSinceLastMovement < 180)
        {
            options.Add("Outlet/sezon sonu satışı");
            options.Add("Toptan satış");
            options.Add("Çalışan indirimi");
        }

        if (daysSinceLastMovement >= 180)
        {
            options.Add("Tasfiye satışı");
            options.Add("Bağış");
            options.Add("Geri dönüşüm");
            options.Add("İmha");
        }

        return options;
    }

    private static List<string> GenerateDeadStockRecommendations(List<DeadStockItemDto> items)
    {
        var recommendations = new List<string>();

        if (items.Count == 0)
        {
            recommendations.Add("Ölü stok bulunmuyor - stok yönetimi iyi durumda.");
            return recommendations;
        }

        var totalValue = items.Sum(i => i.StockValue);
        recommendations.Add($"Toplam {items.Count} ürün, {totalValue:N0} TL değerinde ölü stok tespit edildi.");

        var over180Days = items.Count(i => i.DaysSinceLastMovement >= 180);
        if (over180Days > 0)
        {
            recommendations.Add($"{over180Days} ürün 6 aydan fazla süredir hareket görmemiş - tasfiye değerlendirmesi yapılmalı.");
        }

        var highValue = items.Where(i => i.StockValue > 10000).ToList();
        if (highValue.Count > 0)
        {
            recommendations.Add($"{highValue.Count} yüksek değerli ölü stok ürünü öncelikli olarak ele alınmalı.");
        }

        return recommendations;
    }
}
