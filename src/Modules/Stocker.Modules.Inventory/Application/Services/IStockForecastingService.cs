using Stocker.Modules.Inventory.Application.DTOs;

namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Service interface for stock forecasting and auto-reorder operations
/// </summary>
public interface IStockForecastingService
{
    // =====================================
    // FORECASTING OPERATIONS
    // =====================================

    /// <summary>
    /// Get demand forecast for a single product
    /// </summary>
    Task<ProductForecastDto?> GetProductForecastAsync(
        int productId,
        int? warehouseId = null,
        int forecastDays = 30,
        ForecastingMethod method = ForecastingMethod.ExponentialSmoothing,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get forecasts for multiple products based on filter criteria
    /// </summary>
    Task<List<ProductForecastDto>> GetProductForecastsAsync(
        StockForecastFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get aggregate forecast summary with risk analysis
    /// </summary>
    Task<ForecastSummaryDto> GetForecastSummaryAsync(
        StockForecastFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Analyze historical demand patterns for a product
    /// </summary>
    Task<DemandAnalysisDto?> GetDemandAnalysisAsync(
        int productId,
        int? warehouseId = null,
        int analysisDays = 90,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate recommended safety stock levels
    /// </summary>
    Task<SafetyStockCalculationDto?> GetSafetyStockCalculationAsync(
        int productId,
        decimal serviceLevel = 0.95m,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get stock optimization recommendations
    /// </summary>
    Task<StockOptimizationDto?> GetStockOptimizationAsync(
        int productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get stock optimization recommendations for multiple products
    /// </summary>
    Task<List<StockOptimizationDto>> GetBulkStockOptimizationsAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // REORDER RULE OPERATIONS
    // =====================================

    /// <summary>
    /// Get all reorder rules
    /// </summary>
    Task<List<ReorderRuleDto>> GetReorderRulesAsync(
        int? productId = null,
        int? categoryId = null,
        int? warehouseId = null,
        ReorderRuleStatus? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific reorder rule by ID
    /// </summary>
    Task<ReorderRuleDto?> GetReorderRuleByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new reorder rule
    /// </summary>
    Task<ReorderRuleDto> CreateReorderRuleAsync(
        CreateReorderRuleDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing reorder rule
    /// </summary>
    Task<ReorderRuleDto?> UpdateReorderRuleAsync(
        int id,
        CreateReorderRuleDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a reorder rule
    /// </summary>
    Task<bool> DeleteReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Activate a reorder rule
    /// </summary>
    Task<bool> ActivateReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Pause a reorder rule
    /// </summary>
    Task<bool> PauseReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Disable a reorder rule
    /// </summary>
    Task<bool> DisableReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute a reorder rule manually
    /// </summary>
    Task<List<ReorderSuggestionDto>> ExecuteReorderRuleAsync(
        int id,
        CancellationToken cancellationToken = default);

    // =====================================
    // REORDER SUGGESTION OPERATIONS
    // =====================================

    /// <summary>
    /// Get paginated reorder suggestions
    /// </summary>
    Task<PaginatedReorderSuggestionsDto> GetReorderSuggestionsAsync(
        ReorderSuggestionFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific reorder suggestion by ID
    /// </summary>
    Task<ReorderSuggestionDto?> GetReorderSuggestionByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generate reorder suggestions for all products based on current rules
    /// </summary>
    Task<List<ReorderSuggestionDto>> GenerateReorderSuggestionsAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Process a reorder suggestion (approve/reject)
    /// </summary>
    Task<ReorderSuggestionDto?> ProcessReorderSuggestionAsync(
        int id,
        ProcessReorderSuggestionDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bulk process reorder suggestions
    /// </summary>
    Task<int> BulkProcessReorderSuggestionsAsync(
        List<int> ids,
        ProcessReorderSuggestionDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Expire old pending suggestions
    /// </summary>
    Task<int> ExpireOldSuggestionsAsync(
        int daysOld = 7,
        CancellationToken cancellationToken = default);

    // =====================================
    // ANALYSIS & REPORTING
    // =====================================

    /// <summary>
    /// Get ABC classification for products
    /// </summary>
    Task<Dictionary<string, List<int>>> GetAbcClassificationAsync(
        int? categoryId = null,
        int analysisDays = 365,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get products at risk of stockout
    /// </summary>
    Task<List<ProductForecastDto>> GetStockoutRiskProductsAsync(
        int riskDays = 7,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get seasonal patterns for a product
    /// </summary>
    Task<List<SeasonalPatternDto>> GetSeasonalPatternsAsync(
        int productId,
        CancellationToken cancellationToken = default);
}
