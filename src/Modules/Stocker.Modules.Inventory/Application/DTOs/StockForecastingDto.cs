using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

// =====================================
// STOCK FORECASTING & AUTO-REORDER DTOs
// =====================================

/// <summary>
/// Forecasting method types
/// </summary>
public enum ForecastingMethod
{
    /// <summary>Simple Moving Average</summary>
    SimpleMovingAverage,
    /// <summary>Weighted Moving Average</summary>
    WeightedMovingAverage,
    /// <summary>Exponential Smoothing</summary>
    ExponentialSmoothing,
    /// <summary>Linear Regression</summary>
    LinearRegression,
    /// <summary>Seasonal Decomposition</summary>
    SeasonalDecomposition
}

// Note: ReorderRuleStatus and ReorderSuggestionStatus are defined in Domain.Enums
// and imported via 'using Stocker.Modules.Inventory.Domain.Enums;'

/// <summary>
/// Filter for stock forecasting
/// </summary>
public class StockForecastFilterDto
{
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public int ForecastDays { get; set; } = 30;
    public ForecastingMethod Method { get; set; } = ForecastingMethod.ExponentialSmoothing;
    public bool IncludeSeasonality { get; set; } = true;
    public int HistoricalDays { get; set; } = 90;
}

/// <summary>
/// Daily forecast data point
/// </summary>
public class DailyForecastDto
{
    public DateTime Date { get; set; }
    public decimal ForecastedDemand { get; set; }
    public decimal LowerBound { get; set; }
    public decimal UpperBound { get; set; }
    public decimal ConfidenceLevel { get; set; }
}

/// <summary>
/// Product stock forecast
/// </summary>
public class ProductForecastDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }

    // Current Stock Status
    public decimal CurrentStock { get; set; }
    public decimal AvailableStock { get; set; }
    public decimal ReservedStock { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }
    public decimal ReorderQuantity { get; set; }
    public int LeadTimeDays { get; set; }

    // Historical Analysis
    public decimal AverageDailyDemand { get; set; }
    public decimal DemandStandardDeviation { get; set; }
    public decimal SeasonalityFactor { get; set; }
    public decimal TrendDirection { get; set; } // Positive = increasing, Negative = decreasing

    // Forecast Results
    public ForecastingMethod MethodUsed { get; set; }
    public decimal ForecastAccuracy { get; set; } // MAPE (Mean Absolute Percentage Error)
    public int EstimatedDaysUntilStockout { get; set; }
    public DateTime? ExpectedStockoutDate { get; set; }
    public decimal TotalForecastedDemand { get; set; }

    // Daily Forecasts
    public List<DailyForecastDto> DailyForecasts { get; set; } = new();

    // Recommendations
    public bool NeedsReorder { get; set; }
    public decimal SuggestedReorderQuantity { get; set; }
    public DateTime? SuggestedOrderDate { get; set; }
    public string? ReorderReason { get; set; }
}

/// <summary>
/// Aggregate forecast summary
/// </summary>
public class ForecastSummaryDto
{
    public DateTime GeneratedAt { get; set; }
    public int ForecastPeriodDays { get; set; }
    public ForecastingMethod MethodUsed { get; set; }

    // Overall Stats
    public int TotalProductsAnalyzed { get; set; }
    public int ProductsNeedingReorder { get; set; }
    public int ProductsAtRisk { get; set; } // Within lead time of stockout
    public int ProductsInStockout { get; set; }

    // Value Projections
    public decimal TotalForecastedDemandValue { get; set; }
    public decimal TotalSuggestedReorderValue { get; set; }
    public string Currency { get; set; } = "TRY";

    // Risk Distribution
    public int HighRiskProducts { get; set; } // Days until stockout < lead time
    public int MediumRiskProducts { get; set; } // Days until stockout < 2x lead time
    public int LowRiskProducts { get; set; } // Days until stockout >= 2x lead time

    // Category Breakdown
    public List<CategoryForecastSummaryDto> ByCategory { get; set; } = new();

    // Top Products to Reorder
    public List<ProductForecastDto> TopReorderProducts { get; set; } = new();
}

/// <summary>
/// Category-level forecast summary
/// </summary>
public class CategoryForecastSummaryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = default!;
    public int ProductCount { get; set; }
    public int ProductsNeedingReorder { get; set; }
    public decimal TotalForecastedDemand { get; set; }
    public decimal TotalSuggestedReorderValue { get; set; }
}

/// <summary>
/// Auto-reorder rule configuration
/// </summary>
public class ReorderRuleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    // Scope
    public int? ProductId { get; set; }
    public string? ProductCode { get; set; }
    public string? ProductName { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }

    // Trigger Conditions
    public decimal? TriggerBelowQuantity { get; set; }
    public int? TriggerBelowDaysOfStock { get; set; }
    public bool TriggerOnForecast { get; set; }
    public int? ForecastLeadTimeDays { get; set; }

    // Reorder Settings
    public decimal? FixedReorderQuantity { get; set; }
    public decimal? ReorderUpToQuantity { get; set; } // Order up to this level
    public bool UseEconomicOrderQuantity { get; set; }
    public decimal? MinimumOrderQuantity { get; set; }
    public decimal? MaximumOrderQuantity { get; set; }
    public bool RoundToPackSize { get; set; }
    public decimal? PackSize { get; set; }

    // Schedule
    public bool IsScheduled { get; set; }
    public string? CronExpression { get; set; } // e.g., "0 8 * * 1" for every Monday 8am
    public DateTime? NextScheduledRun { get; set; }

    // Status
    public ReorderRuleStatus Status { get; set; }
    public bool RequiresApproval { get; set; }
    public int? ApproverUserId { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastExecutedAt { get; set; }
    public int ExecutionCount { get; set; }
}

/// <summary>
/// Create/Update reorder rule
/// </summary>
public class CreateReorderRuleDto
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    // Scope
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public int? SupplierId { get; set; }

    // Trigger Conditions
    public decimal? TriggerBelowQuantity { get; set; }
    public int? TriggerBelowDaysOfStock { get; set; }
    public bool TriggerOnForecast { get; set; }
    public int? ForecastLeadTimeDays { get; set; }

    // Reorder Settings
    public decimal? FixedReorderQuantity { get; set; }
    public decimal? ReorderUpToQuantity { get; set; }
    public bool UseEconomicOrderQuantity { get; set; }
    public decimal? MinimumOrderQuantity { get; set; }
    public decimal? MaximumOrderQuantity { get; set; }
    public bool RoundToPackSize { get; set; }
    public decimal? PackSize { get; set; }

    // Schedule
    public bool IsScheduled { get; set; }
    public string? CronExpression { get; set; }

    // Settings
    public bool RequiresApproval { get; set; }
    public int? ApproverUserId { get; set; }
}

/// <summary>
/// Reorder suggestion generated by the system
/// </summary>
public class ReorderSuggestionDto
{
    public int Id { get; set; }
    public DateTime GeneratedAt { get; set; }

    // Product Info
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? CategoryName { get; set; }

    // Warehouse
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }

    // Current Status
    public decimal CurrentStock { get; set; }
    public decimal AvailableStock { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal ReorderLevel { get; set; }

    // Suggestion Details
    public decimal SuggestedQuantity { get; set; }
    public decimal EstimatedCost { get; set; }
    public string Currency { get; set; } = "TRY";
    public int? SuggestedSupplierId { get; set; }
    public string? SuggestedSupplierName { get; set; }

    // Trigger Info
    public int? TriggeredByRuleId { get; set; }
    public string? TriggerReason { get; set; }
    public int? EstimatedDaysUntilStockout { get; set; }
    public DateTime? ExpectedStockoutDate { get; set; }

    // Status
    public ReorderSuggestionStatus Status { get; set; }
    public string? StatusReason { get; set; }
    public int? ProcessedByUserId { get; set; }
    public string? ProcessedByUserName { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public int? PurchaseOrderId { get; set; }
    public string? PurchaseOrderNumber { get; set; }

    // Validity
    public DateTime ExpiresAt { get; set; }
    public bool IsExpired { get; set; }
}

/// <summary>
/// Filter for reorder suggestions
/// </summary>
public class ReorderSuggestionFilterDto
{
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
    public int? SupplierId { get; set; }
    public ReorderSuggestionStatus? Status { get; set; }
    public bool? ShowExpired { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Paginated reorder suggestions response
/// </summary>
public class PaginatedReorderSuggestionsDto
{
    public List<ReorderSuggestionDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }

    // Summary
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public decimal TotalPendingValue { get; set; }
}

/// <summary>
/// Process reorder suggestion (approve/reject)
/// </summary>
public class ProcessReorderSuggestionDto
{
    public ReorderSuggestionStatus NewStatus { get; set; }
    public string? Reason { get; set; }
    public decimal? AdjustedQuantity { get; set; }
    public int? AlternateSupplierId { get; set; }
}

/// <summary>
/// Safety stock calculation parameters
/// </summary>
public class SafetyStockCalculationDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;

    // Input Parameters
    public decimal AverageDailyDemand { get; set; }
    public decimal DemandStandardDeviation { get; set; }
    public int LeadTimeDays { get; set; }
    public int LeadTimeVariationDays { get; set; }
    public decimal ServiceLevel { get; set; } // e.g., 0.95 for 95%

    // Calculated Values
    public decimal CurrentSafetyStock { get; set; }
    public decimal RecommendedSafetyStock { get; set; }
    public decimal RecommendedReorderPoint { get; set; }
    public decimal EconomicOrderQuantity { get; set; }

    // Explanation
    public string CalculationMethod { get; set; } = default!;
    public string Formula { get; set; } = default!;
}

/// <summary>
/// Demand analysis result
/// </summary>
public class DemandAnalysisDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public int AnalysisPeriodDays { get; set; }

    // Demand Statistics
    public decimal TotalDemand { get; set; }
    public decimal AverageDailyDemand { get; set; }
    public decimal MedianDailyDemand { get; set; }
    public decimal MaxDailyDemand { get; set; }
    public decimal MinDailyDemand { get; set; }
    public decimal StandardDeviation { get; set; }
    public decimal CoefficientOfVariation { get; set; }

    // Trend Analysis
    public string TrendDirection { get; set; } = default!; // "Increasing", "Decreasing", "Stable"
    public decimal TrendPercentage { get; set; }

    // Seasonality
    public bool HasSeasonality { get; set; }
    public List<SeasonalPatternDto>? SeasonalPatterns { get; set; }

    // ABC Classification
    public string ABCClass { get; set; } = default!; // "A", "B", "C"
    public decimal RevenueContribution { get; set; }

    // Daily Breakdown
    public List<DailyDemandDto> DailyDemand { get; set; } = new();
}

/// <summary>
/// Seasonal pattern data
/// </summary>
public class SeasonalPatternDto
{
    public string PeriodType { get; set; } = default!; // "Weekly", "Monthly", "Quarterly"
    public string Period { get; set; } = default!; // "Monday", "January", "Q1"
    public decimal IndexValue { get; set; } // 1.0 = average, >1 = above average
    public decimal AverageDemand { get; set; }
}

/// <summary>
/// Daily demand data point
/// </summary>
public class DailyDemandDto
{
    public DateTime Date { get; set; }
    public decimal Demand { get; set; }
    public bool IsOutlier { get; set; }
}

/// <summary>
/// Stock optimization recommendations
/// </summary>
public class StockOptimizationDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = default!;
    public string ProductName { get; set; } = default!;

    // Current Settings
    public decimal CurrentMinStock { get; set; }
    public decimal CurrentMaxStock { get; set; }
    public decimal CurrentReorderLevel { get; set; }
    public decimal CurrentReorderQuantity { get; set; }

    // Recommended Settings
    public decimal RecommendedMinStock { get; set; }
    public decimal RecommendedMaxStock { get; set; }
    public decimal RecommendedReorderLevel { get; set; }
    public decimal RecommendedReorderQuantity { get; set; }
    public decimal RecommendedSafetyStock { get; set; }

    // Impact Analysis
    public decimal CurrentAverageInventory { get; set; }
    public decimal RecommendedAverageInventory { get; set; }
    public decimal InventoryReductionPercent { get; set; }
    public decimal CurrentServiceLevel { get; set; }
    public decimal RecommendedServiceLevel { get; set; }
    public decimal EstimatedAnnualSavings { get; set; }

    // Recommendations
    public List<string> Recommendations { get; set; } = new();
}
