using Stocker.Modules.Inventory.Application.DTOs;

namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Service interface for advanced inventory analysis (ABC/XYZ, turnover, dead stock)
/// </summary>
public interface IInventoryAnalysisService
{
    // =====================================
    // ABC/XYZ ANALYSIS
    // =====================================

    /// <summary>
    /// Perform complete ABC/XYZ analysis on inventory
    /// </summary>
    Task<AbcXyzAnalysisSummaryDto> GetAbcXyzAnalysisAsync(
        AbcXyzAnalysisFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get ABC/XYZ classification for a specific product
    /// </summary>
    Task<ProductAbcXyzDto?> GetProductAbcXyzClassificationAsync(
        int productId,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all products in a specific ABC/XYZ class combination
    /// </summary>
    Task<List<ProductAbcXyzDto>> GetProductsByClassAsync(
        AbcXyzClass combinedClass,
        AbcXyzAnalysisFilterDto? filter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get ABC/XYZ matrix data for visualization
    /// </summary>
    Task<List<AbcXyzMatrixCellDto>> GetAbcXyzMatrixAsync(
        AbcXyzAnalysisFilterDto? filter = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // INVENTORY TURNOVER ANALYSIS
    // =====================================

    /// <summary>
    /// Get inventory turnover analysis for all products
    /// </summary>
    Task<List<InventoryTurnoverDto>> GetInventoryTurnoverAnalysisAsync(
        int? categoryId = null,
        int? warehouseId = null,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get inventory turnover for a specific product
    /// </summary>
    Task<InventoryTurnoverDto?> GetProductTurnoverAsync(
        int productId,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get slow-moving inventory items
    /// </summary>
    Task<List<InventoryTurnoverDto>> GetSlowMovingInventoryAsync(
        int daysThreshold = 90,
        int? categoryId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // DEAD STOCK ANALYSIS
    // =====================================

    /// <summary>
    /// Get dead stock analysis
    /// </summary>
    Task<DeadStockAnalysisDto> GetDeadStockAnalysisAsync(
        int noMovementDays = 90,
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get aging analysis for inventory
    /// </summary>
    Task<Dictionary<string, List<DeadStockItemDto>>> GetInventoryAgingAnalysisAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // SERVICE LEVEL ANALYSIS
    // =====================================

    /// <summary>
    /// Get service level analysis for products
    /// </summary>
    Task<List<ServiceLevelAnalysisDto>> GetServiceLevelAnalysisAsync(
        int? categoryId = null,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get service level for a specific product
    /// </summary>
    Task<ServiceLevelAnalysisDto?> GetProductServiceLevelAsync(
        int productId,
        int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default);

    // =====================================
    // STRATEGIC RECOMMENDATIONS
    // =====================================

    /// <summary>
    /// Get strategic inventory recommendations based on all analyses
    /// </summary>
    Task<List<StrategicRecommendationDto>> GetStrategicRecommendationsAsync(
        int? categoryId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get inventory health score and metrics
    /// </summary>
    Task<InventoryHealthScoreDto> GetInventoryHealthScoreAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Inventory health score and metrics
/// </summary>
public class InventoryHealthScoreDto
{
    public DateTime GeneratedAt { get; set; }
    public int OverallScore { get; set; } // 0-100

    // Component scores
    public int TurnoverScore { get; set; }
    public int StockoutScore { get; set; }
    public int DeadStockScore { get; set; }
    public int AccuracyScore { get; set; }
    public int BalanceScore { get; set; } // ABC distribution balance

    // Key metrics
    public decimal AverageInventoryTurnover { get; set; }
    public decimal StockoutRate { get; set; }
    public decimal DeadStockPercentage { get; set; }
    public decimal OverstockPercentage { get; set; }
    public decimal ServiceLevel { get; set; }

    // Trends
    public string TurnoverTrend { get; set; } = default!; // "Improving", "Declining", "Stable"
    public string HealthTrend { get; set; } = default!;

    // Recommendations
    public List<string> ImprovementAreas { get; set; } = new();
    public decimal PotentialSavings { get; set; }
}
