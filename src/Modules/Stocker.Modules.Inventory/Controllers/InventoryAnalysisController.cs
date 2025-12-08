using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;

namespace Stocker.Modules.Inventory.Controllers;

/// <summary>
/// Controller for advanced inventory analysis operations (ABC/XYZ, turnover, dead stock)
/// </summary>
[ApiController]
[Route("api/inventory/analysis")]
[Authorize]
public class InventoryAnalysisController : ControllerBase
{
    private readonly IInventoryAnalysisService _analysisService;

    public InventoryAnalysisController(IInventoryAnalysisService analysisService)
    {
        _analysisService = analysisService;
    }

    // =====================================
    // ABC/XYZ ANALYSIS ENDPOINTS
    // =====================================

    /// <summary>
    /// Get complete ABC/XYZ analysis for inventory
    /// </summary>
    [HttpGet("abc-xyz")]
    [ProducesResponseType(typeof(AbcXyzAnalysisSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AbcXyzAnalysisSummaryDto>> GetAbcXyzAnalysis(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int? brandId = null,
        [FromQuery] int analysisPeriodDays = 365,
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var filter = new AbcXyzAnalysisFilterDto
        {
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            BrandId = brandId,
            AnalysisPeriodDays = analysisPeriodDays,
            IncludeInactiveProducts = includeInactive
        };

        var result = await _analysisService.GetAbcXyzAnalysisAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get ABC/XYZ classification for a specific product
    /// </summary>
    [HttpGet("abc-xyz/product/{productId:int}")]
    [ProducesResponseType(typeof(ProductAbcXyzDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductAbcXyzDto>> GetProductAbcXyzClassification(
        int productId,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetProductAbcXyzClassificationAsync(
            productId, analysisPeriodDays, cancellationToken);

        if (result == null)
            return NotFound(new { message = "Ürün bulunamadı" });

        return Ok(result);
    }

    /// <summary>
    /// Get products by ABC/XYZ class combination
    /// </summary>
    [HttpGet("abc-xyz/class/{combinedClass}")]
    [ProducesResponseType(typeof(List<ProductAbcXyzDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductAbcXyzDto>>> GetProductsByClass(
        AbcXyzClass combinedClass,
        [FromQuery] int? categoryId = null,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var filter = new AbcXyzAnalysisFilterDto
        {
            CategoryId = categoryId,
            AnalysisPeriodDays = analysisPeriodDays
        };

        var result = await _analysisService.GetProductsByClassAsync(combinedClass, filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get ABC/XYZ matrix data for visualization
    /// </summary>
    [HttpGet("abc-xyz/matrix")]
    [ProducesResponseType(typeof(List<AbcXyzMatrixCellDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AbcXyzMatrixCellDto>>> GetAbcXyzMatrix(
        [FromQuery] int? categoryId = null,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var filter = new AbcXyzAnalysisFilterDto
        {
            CategoryId = categoryId,
            AnalysisPeriodDays = analysisPeriodDays
        };

        var result = await _analysisService.GetAbcXyzMatrixAsync(filter, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // INVENTORY TURNOVER ENDPOINTS
    // =====================================

    /// <summary>
    /// Get inventory turnover analysis for all products
    /// </summary>
    [HttpGet("turnover")]
    [ProducesResponseType(typeof(List<InventoryTurnoverDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InventoryTurnoverDto>>> GetInventoryTurnoverAnalysis(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetInventoryTurnoverAnalysisAsync(
            categoryId, warehouseId, analysisPeriodDays, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get turnover analysis for a specific product
    /// </summary>
    [HttpGet("turnover/product/{productId:int}")]
    [ProducesResponseType(typeof(InventoryTurnoverDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InventoryTurnoverDto>> GetProductTurnover(
        int productId,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetProductTurnoverAsync(
            productId, analysisPeriodDays, cancellationToken);

        if (result == null)
            return NotFound(new { message = "Ürün bulunamadı" });

        return Ok(result);
    }

    /// <summary>
    /// Get slow-moving inventory items
    /// </summary>
    [HttpGet("turnover/slow-moving")]
    [ProducesResponseType(typeof(List<InventoryTurnoverDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InventoryTurnoverDto>>> GetSlowMovingInventory(
        [FromQuery] int daysThreshold = 90,
        [FromQuery] int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetSlowMovingInventoryAsync(
            daysThreshold, categoryId, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // DEAD STOCK ENDPOINTS
    // =====================================

    /// <summary>
    /// Get dead stock analysis
    /// </summary>
    [HttpGet("dead-stock")]
    [ProducesResponseType(typeof(DeadStockAnalysisDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DeadStockAnalysisDto>> GetDeadStockAnalysis(
        [FromQuery] int noMovementDays = 90,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetDeadStockAnalysisAsync(
            noMovementDays, categoryId, warehouseId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get inventory aging analysis
    /// </summary>
    [HttpGet("aging")]
    [ProducesResponseType(typeof(Dictionary<string, List<DeadStockItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Dictionary<string, List<DeadStockItemDto>>>> GetInventoryAgingAnalysis(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetInventoryAgingAnalysisAsync(
            categoryId, warehouseId, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // SERVICE LEVEL ENDPOINTS
    // =====================================

    /// <summary>
    /// Get service level analysis for products
    /// </summary>
    [HttpGet("service-level")]
    [ProducesResponseType(typeof(List<ServiceLevelAnalysisDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ServiceLevelAnalysisDto>>> GetServiceLevelAnalysis(
        [FromQuery] int? categoryId = null,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetServiceLevelAnalysisAsync(
            categoryId, analysisPeriodDays, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get service level for a specific product
    /// </summary>
    [HttpGet("service-level/product/{productId:int}")]
    [ProducesResponseType(typeof(ServiceLevelAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ServiceLevelAnalysisDto>> GetProductServiceLevel(
        int productId,
        [FromQuery] int analysisPeriodDays = 365,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetProductServiceLevelAsync(
            productId, analysisPeriodDays, cancellationToken);

        if (result == null)
            return NotFound(new { message = "Ürün bulunamadı" });

        return Ok(result);
    }

    // =====================================
    // STRATEGIC INSIGHTS ENDPOINTS
    // =====================================

    /// <summary>
    /// Get strategic recommendations based on analysis
    /// </summary>
    [HttpGet("recommendations")]
    [ProducesResponseType(typeof(List<StrategicRecommendationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<StrategicRecommendationDto>>> GetStrategicRecommendations(
        [FromQuery] int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetStrategicRecommendationsAsync(
            categoryId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get overall inventory health score and metrics
    /// </summary>
    [HttpGet("health-score")]
    [ProducesResponseType(typeof(InventoryHealthScoreDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<InventoryHealthScoreDto>> GetInventoryHealthScore(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _analysisService.GetInventoryHealthScoreAsync(
            categoryId, warehouseId, cancellationToken);
        return Ok(result);
    }
}
