namespace Stocker.Modules.Inventory.Application.DTOs;

// =====================================
// ABC/XYZ INVENTORY ANALYSIS DTOs
// =====================================

/// <summary>
/// ABC classification (value-based: A=80% of value, B=15%, C=5%)
/// </summary>
public enum AbcClass
{
    /// <summary>High value items - ~20% of items representing ~80% of value</summary>
    A,
    /// <summary>Medium value items - ~30% of items representing ~15% of value</summary>
    B,
    /// <summary>Low value items - ~50% of items representing ~5% of value</summary>
    C
}

/// <summary>
/// XYZ classification (demand variability-based)
/// </summary>
public enum XyzClass
{
    /// <summary>Constant demand - CV less than 0.5</summary>
    X,
    /// <summary>Variable demand - CV between 0.5 and 1.0</summary>
    Y,
    /// <summary>Highly variable/sporadic demand - CV greater than 1.0</summary>
    Z
}

/// <summary>
/// Combined ABC-XYZ matrix position
/// </summary>
public enum AbcXyzClass
{
    AX, AY, AZ,
    BX, BY, BZ,
    CX, CY, CZ
}

/// <summary>
/// Filter for ABC/XYZ analysis
/// </summary>
public class AbcXyzAnalysisFilterDto
{
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public int? BrandId { get; set; }
    public int AnalysisPeriodDays { get; set; } = 365;
    public bool IncludeInactiveProducts { get; set; } = false;

    // ABC thresholds (cumulative percentage)
    public decimal AbcAThreshold { get; set; } = 80m; // Top 80% of value
    public decimal AbcBThreshold { get; set; } = 95m; // Next 15% (80-95%)

    // XYZ thresholds (coefficient of variation)
    public decimal XyzXThreshold { get; set; } = 0.5m; // CV < 0.5
    public decimal XyzYThreshold { get; set; } = 1.0m; // CV 0.5-1.0
}

/// <summary>
/// Individual product ABC/XYZ classification result
/// </summary>
public class ProductAbcXyzDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }
    public string? BrandName { get; set; }

    // Value metrics (for ABC)
    public decimal TotalRevenue { get; set; }
    public decimal TotalQuantitySold { get; set; }
    public decimal AverageUnitPrice { get; set; }
    public decimal RevenuePercentage { get; set; }
    public decimal CumulativeRevenuePercentage { get; set; }

    // Demand metrics (for XYZ)
    public decimal AverageDailyDemand { get; set; }
    public decimal DemandStandardDeviation { get; set; }
    public decimal CoefficientOfVariation { get; set; }
    public int DaysWithDemand { get; set; }
    public int TotalDays { get; set; }
    public decimal DemandFrequency { get; set; } // % of days with demand

    // Classification
    public AbcClass AbcClass { get; set; }
    public XyzClass XyzClass { get; set; }
    public AbcXyzClass CombinedClass { get; set; }

    // Current stock info
    public decimal CurrentStock { get; set; }
    public decimal AvailableStock { get; set; }
    public decimal StockValue { get; set; }
    public int EstimatedDaysOfStock { get; set; }

    // Recommendations
    public string ManagementStrategy { get; set; } = default!;
    public List<string> Recommendations { get; set; } = new();
}

/// <summary>
/// ABC/XYZ analysis summary
/// </summary>
public class AbcXyzAnalysisSummaryDto
{
    public DateTime GeneratedAt { get; set; }
    public int AnalysisPeriodDays { get; set; }
    public int TotalProductsAnalyzed { get; set; }

    // ABC Distribution
    public AbcClassSummaryDto ClassA { get; set; } = new();
    public AbcClassSummaryDto ClassB { get; set; } = new();
    public AbcClassSummaryDto ClassC { get; set; } = new();

    // XYZ Distribution
    public XyzClassSummaryDto ClassX { get; set; } = new();
    public XyzClassSummaryDto ClassY { get; set; } = new();
    public XyzClassSummaryDto ClassZ { get; set; } = new();

    // Matrix Distribution (9 cells)
    public List<AbcXyzMatrixCellDto> Matrix { get; set; } = new();

    // Top products by class
    public List<ProductAbcXyzDto> TopAProducts { get; set; } = new();
    public List<ProductAbcXyzDto> HighRiskProducts { get; set; } = new(); // AZ, BZ items

    // Overall metrics
    public decimal TotalRevenue { get; set; }
    public decimal TotalStockValue { get; set; }
    public decimal AverageInventoryTurnover { get; set; }

    // Recommendations
    public List<StrategicRecommendationDto> StrategicRecommendations { get; set; } = new();
}

/// <summary>
/// ABC class summary statistics
/// </summary>
public class AbcClassSummaryDto
{
    public AbcClass Class { get; set; }
    public int ProductCount { get; set; }
    public decimal ProductPercentage { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RevenuePercentage { get; set; }
    public decimal TotalStockValue { get; set; }
    public decimal StockValuePercentage { get; set; }
    public decimal AverageInventoryTurnover { get; set; }
}

/// <summary>
/// XYZ class summary statistics
/// </summary>
public class XyzClassSummaryDto
{
    public XyzClass Class { get; set; }
    public int ProductCount { get; set; }
    public decimal ProductPercentage { get; set; }
    public decimal AverageCoefficientOfVariation { get; set; }
    public decimal AverageDemandFrequency { get; set; }
    public string DemandPattern { get; set; } = default!; // "Constant", "Variable", "Sporadic"
}

/// <summary>
/// ABC-XYZ matrix cell data
/// </summary>
public class AbcXyzMatrixCellDto
{
    public AbcXyzClass CombinedClass { get; set; }
    public int ProductCount { get; set; }
    public decimal ProductPercentage { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RevenuePercentage { get; set; }
    public decimal TotalStockValue { get; set; }
    public string ManagementPriority { get; set; } = default!; // "Critical", "High", "Medium", "Low"
    public string RecommendedStrategy { get; set; } = default!;
}

/// <summary>
/// Strategic recommendation based on analysis
/// </summary>
public class StrategicRecommendationDto
{
    public string Category { get; set; } = default!; // "Inventory Optimization", "Risk Management", etc.
    public string Priority { get; set; } = default!; // "High", "Medium", "Low"
    public string Recommendation { get; set; } = default!;
    public string Impact { get; set; } = default!;
    public List<int> AffectedProductIds { get; set; } = new();
    public decimal? EstimatedSavings { get; set; }
}

/// <summary>
/// Inventory turnover analysis result
/// </summary>
public class InventoryTurnoverDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }

    // Turnover metrics
    public decimal CostOfGoodsSold { get; set; }
    public decimal AverageInventoryValue { get; set; }
    public decimal InventoryTurnoverRatio { get; set; }
    public int DaysOfInventory { get; set; } // DOI = 365 / Turnover

    // Performance
    public string TurnoverCategory { get; set; } = default!; // "Fast", "Medium", "Slow", "Dead"
    public decimal IndustryBenchmark { get; set; }
    public decimal PerformanceVsBenchmark { get; set; } // % above/below benchmark

    // Stock status
    public decimal CurrentStock { get; set; }
    public decimal StockValue { get; set; }
    public bool IsOverstocked { get; set; }
    public bool IsUnderstocked { get; set; }
    public decimal OptimalStockLevel { get; set; }
}

/// <summary>
/// Dead stock analysis result
/// </summary>
public class DeadStockAnalysisDto
{
    public DateTime GeneratedAt { get; set; }
    public int AnalysisPeriodDays { get; set; }

    // Summary
    public int TotalDeadStockItems { get; set; }
    public decimal TotalDeadStockValue { get; set; }
    public decimal DeadStockPercentage { get; set; } // % of total inventory value

    // Items
    public List<DeadStockItemDto> Items { get; set; } = new();

    // Recommendations
    public List<string> Recommendations { get; set; } = new();
    public decimal PotentialRecoveryValue { get; set; }
}

/// <summary>
/// Individual dead stock item
/// </summary>
public class DeadStockItemDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }

    public decimal CurrentStock { get; set; }
    public decimal StockValue { get; set; }
    public int DaysSinceLastSale { get; set; }
    public int DaysSinceLastMovement { get; set; }
    public DateTime? LastSaleDate { get; set; }
    public DateTime? LastMovementDate { get; set; }

    public string AgingCategory { get; set; } = default!; // "30-60 days", "60-90 days", "90+ days"
    public decimal DepreciationRate { get; set; }
    public decimal EstimatedRecoveryValue { get; set; }

    public List<string> DisposalOptions { get; set; } = new();
}

/// <summary>
/// Service level analysis for products
/// </summary>
public class ServiceLevelAnalysisDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;

    // Service level metrics
    public decimal CurrentServiceLevel { get; set; } // Fill rate %
    public decimal TargetServiceLevel { get; set; }
    public int TotalOrders { get; set; }
    public int FulfilledOrders { get; set; }
    public int StockoutEvents { get; set; }
    public decimal AverageStockoutDuration { get; set; } // days

    // Cost of stockouts
    public decimal EstimatedLostSales { get; set; }
    public decimal BackorderCost { get; set; }

    // Improvement recommendations
    public decimal RecommendedSafetyStock { get; set; }
    public decimal AdditionalStockCost { get; set; }
    public decimal ExpectedServiceLevelImprovement { get; set; }
}
