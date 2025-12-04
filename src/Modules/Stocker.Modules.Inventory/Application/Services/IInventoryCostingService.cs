using Stocker.Modules.Inventory.Application.DTOs;

namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Service interface for inventory costing operations (FIFO/LIFO/WAC)
/// </summary>
public interface IInventoryCostingService
{
    // =====================================
    // COST LAYER OPERATIONS
    // =====================================

    /// <summary>
    /// Get paginated cost layers with filtering
    /// </summary>
    Task<PaginatedCostLayersDto> GetCostLayersAsync(
        CostLayerFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost layers for a specific product
    /// </summary>
    Task<List<CostLayerDto>> GetProductCostLayersAsync(
        int productId,
        int? warehouseId = null,
        bool includeFullyConsumed = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new cost layer (when receiving inventory)
    /// </summary>
    Task<CostLayerDto> CreateCostLayerAsync(
        CreateCostLayerDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Consume from cost layers (when issuing inventory)
    /// </summary>
    Task<CostCalculationResultDto> ConsumeFromCostLayersAsync(
        CostCalculationRequestDto request,
        CancellationToken cancellationToken = default);

    // =====================================
    // PRODUCT COSTING
    // =====================================

    /// <summary>
    /// Get costing summary for a product
    /// </summary>
    Task<ProductCostingSummaryDto?> GetProductCostingSummaryAsync(
        int productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get costing summaries for multiple products
    /// </summary>
    Task<List<ProductCostingSummaryDto>> GetProductCostingSummariesAsync(
        int? categoryId = null,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate COGS for a quantity using specific method
    /// </summary>
    Task<CostCalculationResultDto> CalculateCOGSAsync(
        CostCalculationRequestDto request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Compare costs across different methods
    /// </summary>
    Task<CostMethodComparisonDto> CompareCostMethodsAsync(
        int productId,
        decimal quantity,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // INVENTORY VALUATION
    // =====================================

    /// <summary>
    /// Generate inventory valuation report
    /// </summary>
    Task<InventoryValuationReportDto> GetInventoryValuationAsync(
        InventoryValuationFilterDto filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get total inventory value
    /// </summary>
    Task<decimal> GetTotalInventoryValueAsync(
        CostingMethod method = CostingMethod.WeightedAverageCost,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // COGS REPORTING
    // =====================================

    /// <summary>
    /// Generate COGS report for a period
    /// </summary>
    Task<COGSReportDto> GetCOGSReportAsync(
        COGSReportFilterDto filter,
        CancellationToken cancellationToken = default);

    // =====================================
    // STANDARD COST MANAGEMENT
    // =====================================

    /// <summary>
    /// Set standard cost for a product
    /// </summary>
    Task<bool> SetStandardCostAsync(
        SetStandardCostDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost variance analysis
    /// </summary>
    Task<List<CostVarianceAnalysisDto>> GetCostVarianceAnalysisAsync(
        int? categoryId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // COST ADJUSTMENTS
    // =====================================

    /// <summary>
    /// Adjust cost for inventory
    /// </summary>
    Task<bool> AdjustCostAsync(
        CostAdjustmentDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculate weighted average cost
    /// </summary>
    Task<decimal> RecalculateWACAsync(
        int productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    // =====================================
    // COSTING METHOD CONFIGURATION
    // =====================================

    /// <summary>
    /// Get current costing method for a product
    /// </summary>
    Task<CostingMethod> GetProductCostingMethodAsync(
        int productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Set costing method for a product
    /// </summary>
    Task<bool> SetProductCostingMethodAsync(
        int productId,
        CostingMethod method,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get supported costing methods
    /// </summary>
    Dictionary<string, string> GetCostingMethods();
}
