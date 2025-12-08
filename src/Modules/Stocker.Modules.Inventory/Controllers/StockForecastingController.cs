using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Controllers;

/// <summary>
/// Controller for stock forecasting and auto-reorder operations
/// </summary>
[ApiController]
[Route("api/inventory/forecasting")]
[Authorize]
public class StockForecastingController : ControllerBase
{
    private readonly IStockForecastingService _forecastingService;

    public StockForecastingController(IStockForecastingService forecastingService)
    {
        _forecastingService = forecastingService;
    }

    // =====================================
    // FORECASTING ENDPOINTS
    // =====================================

    /// <summary>
    /// Get demand forecast for a single product
    /// </summary>
    [HttpGet("products/{productId}")]
    [ProducesResponseType(typeof(ProductForecastDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductForecastDto>> GetProductForecast(
        int productId,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int forecastDays = 30,
        [FromQuery] ForecastingMethod method = ForecastingMethod.ExponentialSmoothing,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetProductForecastAsync(
            productId, warehouseId, forecastDays, method, cancellationToken);

        if (result == null)
            return NotFound($"Product with ID {productId} not found");

        return Ok(result);
    }

    /// <summary>
    /// Get forecasts for multiple products
    /// </summary>
    [HttpGet("products")]
    [ProducesResponseType(typeof(List<ProductForecastDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductForecastDto>>> GetProductForecasts(
        [FromQuery] int? productId = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int forecastDays = 30,
        [FromQuery] ForecastingMethod method = ForecastingMethod.ExponentialSmoothing,
        [FromQuery] bool includeSeasonality = true,
        [FromQuery] int historicalDays = 90,
        CancellationToken cancellationToken = default)
    {
        var filter = new StockForecastFilterDto
        {
            ProductId = productId,
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            ForecastDays = forecastDays,
            Method = method,
            IncludeSeasonality = includeSeasonality,
            HistoricalDays = historicalDays
        };

        var result = await _forecastingService.GetProductForecastsAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get aggregate forecast summary with risk analysis
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ForecastSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ForecastSummaryDto>> GetForecastSummary(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int forecastDays = 30,
        [FromQuery] ForecastingMethod method = ForecastingMethod.ExponentialSmoothing,
        CancellationToken cancellationToken = default)
    {
        var filter = new StockForecastFilterDto
        {
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            ForecastDays = forecastDays,
            Method = method
        };

        var result = await _forecastingService.GetForecastSummaryAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get products at risk of stockout
    /// </summary>
    [HttpGet("stockout-risk")]
    [ProducesResponseType(typeof(List<ProductForecastDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductForecastDto>>> GetStockoutRiskProducts(
        [FromQuery] int riskDays = 7,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetStockoutRiskProductsAsync(
            riskDays, warehouseId, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // DEMAND ANALYSIS ENDPOINTS
    // =====================================

    /// <summary>
    /// Analyze historical demand patterns for a product
    /// </summary>
    [HttpGet("demand-analysis/{productId}")]
    [ProducesResponseType(typeof(DemandAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DemandAnalysisDto>> GetDemandAnalysis(
        int productId,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int analysisDays = 90,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetDemandAnalysisAsync(
            productId, warehouseId, analysisDays, cancellationToken);

        if (result == null)
            return NotFound($"Product with ID {productId} not found");

        return Ok(result);
    }

    /// <summary>
    /// Get seasonal patterns for a product
    /// </summary>
    [HttpGet("seasonal-patterns/{productId}")]
    [ProducesResponseType(typeof(List<SeasonalPatternDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SeasonalPatternDto>>> GetSeasonalPatterns(
        int productId,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetSeasonalPatternsAsync(productId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get ABC classification for products
    /// </summary>
    [HttpGet("abc-classification")]
    [ProducesResponseType(typeof(Dictionary<string, List<int>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Dictionary<string, List<int>>>> GetAbcClassification(
        [FromQuery] int? categoryId = null,
        [FromQuery] int analysisDays = 365,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetAbcClassificationAsync(
            categoryId, analysisDays, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // SAFETY STOCK & OPTIMIZATION ENDPOINTS
    // =====================================

    /// <summary>
    /// Calculate recommended safety stock levels
    /// </summary>
    [HttpGet("safety-stock/{productId}")]
    [ProducesResponseType(typeof(SafetyStockCalculationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SafetyStockCalculationDto>> GetSafetyStockCalculation(
        int productId,
        [FromQuery] decimal serviceLevel = 0.95m,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetSafetyStockCalculationAsync(
            productId, serviceLevel, cancellationToken);

        if (result == null)
            return NotFound($"Product with ID {productId} not found");

        return Ok(result);
    }

    /// <summary>
    /// Get stock optimization recommendations for a product
    /// </summary>
    [HttpGet("optimization/{productId}")]
    [ProducesResponseType(typeof(StockOptimizationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StockOptimizationDto>> GetStockOptimization(
        int productId,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetStockOptimizationAsync(productId, cancellationToken);

        if (result == null)
            return NotFound($"Product with ID {productId} not found");

        return Ok(result);
    }

    /// <summary>
    /// Get bulk stock optimization recommendations
    /// </summary>
    [HttpGet("optimization")]
    [ProducesResponseType(typeof(List<StockOptimizationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<StockOptimizationDto>>> GetBulkStockOptimizations(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetBulkStockOptimizationsAsync(
            categoryId, warehouseId, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // REORDER RULE ENDPOINTS
    // =====================================

    /// <summary>
    /// Get all reorder rules
    /// </summary>
    [HttpGet("reorder-rules")]
    [ProducesResponseType(typeof(List<ReorderRuleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ReorderRuleDto>>> GetReorderRules(
        [FromQuery] int? productId = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] ReorderRuleStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetReorderRulesAsync(
            productId, categoryId, warehouseId, status, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific reorder rule by ID
    /// </summary>
    [HttpGet("reorder-rules/{id}")]
    [ProducesResponseType(typeof(ReorderRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReorderRuleDto>> GetReorderRuleById(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetReorderRuleByIdAsync(id, cancellationToken);

        if (result == null)
            return NotFound($"Reorder rule with ID {id} not found");

        return Ok(result);
    }

    /// <summary>
    /// Create a new reorder rule
    /// </summary>
    [HttpPost("reorder-rules")]
    [ProducesResponseType(typeof(ReorderRuleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReorderRuleDto>> CreateReorderRule(
        [FromBody] CreateReorderRuleDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.CreateReorderRuleAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetReorderRuleById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing reorder rule
    /// </summary>
    [HttpPut("reorder-rules/{id}")]
    [ProducesResponseType(typeof(ReorderRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReorderRuleDto>> UpdateReorderRule(
        int id,
        [FromBody] CreateReorderRuleDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.UpdateReorderRuleAsync(id, dto, cancellationToken);

        if (result == null)
            return NotFound($"Reorder rule with ID {id} not found");

        return Ok(result);
    }

    /// <summary>
    /// Delete a reorder rule
    /// </summary>
    [HttpDelete("reorder-rules/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteReorderRule(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.DeleteReorderRuleAsync(id, cancellationToken);

        if (!result)
            return NotFound($"Reorder rule with ID {id} not found");

        return NoContent();
    }

    /// <summary>
    /// Activate a reorder rule
    /// </summary>
    [HttpPost("reorder-rules/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateReorderRule(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.ActivateReorderRuleAsync(id, cancellationToken);

        if (!result)
            return NotFound($"Reorder rule with ID {id} not found");

        return Ok(new { message = "Rule activated successfully" });
    }

    /// <summary>
    /// Pause a reorder rule
    /// </summary>
    [HttpPost("reorder-rules/{id}/pause")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PauseReorderRule(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.PauseReorderRuleAsync(id, cancellationToken);

        if (!result)
            return NotFound($"Reorder rule with ID {id} not found");

        return Ok(new { message = "Rule paused successfully" });
    }

    /// <summary>
    /// Disable a reorder rule
    /// </summary>
    [HttpPost("reorder-rules/{id}/disable")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DisableReorderRule(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.DisableReorderRuleAsync(id, cancellationToken);

        if (!result)
            return NotFound($"Reorder rule with ID {id} not found");

        return Ok(new { message = "Rule disabled successfully" });
    }

    /// <summary>
    /// Execute a reorder rule manually
    /// </summary>
    [HttpPost("reorder-rules/{id}/execute")]
    [ProducesResponseType(typeof(List<ReorderSuggestionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<ReorderSuggestionDto>>> ExecuteReorderRule(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.ExecuteReorderRuleAsync(id, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // REORDER SUGGESTION ENDPOINTS
    // =====================================

    /// <summary>
    /// Get paginated reorder suggestions
    /// </summary>
    [HttpGet("suggestions")]
    [ProducesResponseType(typeof(PaginatedReorderSuggestionsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedReorderSuggestionsDto>> GetReorderSuggestions(
        [FromQuery] int? productId = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] ReorderSuggestionStatus? status = null,
        [FromQuery] bool? showExpired = false,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filter = new ReorderSuggestionFilterDto
        {
            ProductId = productId,
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            SupplierId = supplierId,
            Status = status,
            ShowExpired = showExpired,
            FromDate = fromDate,
            ToDate = toDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _forecastingService.GetReorderSuggestionsAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific reorder suggestion by ID
    /// </summary>
    [HttpGet("suggestions/{id}")]
    [ProducesResponseType(typeof(ReorderSuggestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReorderSuggestionDto>> GetReorderSuggestionById(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GetReorderSuggestionByIdAsync(id, cancellationToken);

        if (result == null)
            return NotFound($"Reorder suggestion with ID {id} not found");

        return Ok(result);
    }

    /// <summary>
    /// Generate new reorder suggestions
    /// </summary>
    [HttpPost("suggestions/generate")]
    [ProducesResponseType(typeof(List<ReorderSuggestionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ReorderSuggestionDto>>> GenerateReorderSuggestions(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.GenerateReorderSuggestionsAsync(
            categoryId, warehouseId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Process a reorder suggestion (approve/reject)
    /// </summary>
    [HttpPost("suggestions/{id}/process")]
    [ProducesResponseType(typeof(ReorderSuggestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReorderSuggestionDto>> ProcessReorderSuggestion(
        int id,
        [FromBody] ProcessReorderSuggestionDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _forecastingService.ProcessReorderSuggestionAsync(id, dto, cancellationToken);

        if (result == null)
            return NotFound($"Reorder suggestion with ID {id} not found");

        return Ok(result);
    }

    /// <summary>
    /// Bulk process reorder suggestions
    /// </summary>
    [HttpPost("suggestions/bulk-process")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> BulkProcessReorderSuggestions(
        [FromBody] BulkProcessRequest request,
        CancellationToken cancellationToken = default)
    {
        var count = await _forecastingService.BulkProcessReorderSuggestionsAsync(
            request.Ids, request.ProcessDto, cancellationToken);

        return Ok(new { processedCount = count });
    }

    /// <summary>
    /// Expire old pending suggestions
    /// </summary>
    [HttpPost("suggestions/expire-old")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> ExpireOldSuggestions(
        [FromQuery] int daysOld = 7,
        CancellationToken cancellationToken = default)
    {
        var count = await _forecastingService.ExpireOldSuggestionsAsync(daysOld, cancellationToken);
        return Ok(new { expiredCount = count });
    }
}

/// <summary>
/// Request model for bulk processing suggestions
/// </summary>
public class BulkProcessRequest
{
    public List<int> Ids { get; set; } = new();
    public ProcessReorderSuggestionDto ProcessDto { get; set; } = new();
}
