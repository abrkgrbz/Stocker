using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;

namespace Stocker.Modules.Inventory.Controllers;

/// <summary>
/// Controller for inventory costing operations (FIFO/LIFO/WAC)
/// </summary>
[ApiController]
[Route("api/inventory/costing")]
[Authorize]
public class InventoryCostingController : ControllerBase
{
    private readonly IInventoryCostingService _costingService;

    public InventoryCostingController(IInventoryCostingService costingService)
    {
        _costingService = costingService;
    }

    // =====================================
    // COST LAYER ENDPOINTS
    // =====================================

    /// <summary>
    /// Get paginated cost layers with filtering
    /// </summary>
    [HttpGet("layers")]
    [ProducesResponseType(typeof(PaginatedCostLayersDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedCostLayersDto>> GetCostLayers(
        [FromQuery] int? productId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool includeFullyConsumed = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filter = new CostLayerFilterDto
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            FromDate = fromDate,
            ToDate = toDate,
            IncludeFullyConsumed = includeFullyConsumed,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _costingService.GetCostLayersAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get cost layers for a specific product
    /// </summary>
    [HttpGet("layers/product/{productId}")]
    [ProducesResponseType(typeof(List<CostLayerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CostLayerDto>>> GetProductCostLayers(
        int productId,
        [FromQuery] int? warehouseId = null,
        [FromQuery] bool includeFullyConsumed = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.GetProductCostLayersAsync(
            productId, warehouseId, includeFullyConsumed, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Create a new cost layer (when receiving inventory)
    /// </summary>
    [HttpPost("layers")]
    [ProducesResponseType(typeof(CostLayerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CostLayerDto>> CreateCostLayer(
        [FromBody] CreateCostLayerDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.CreateCostLayerAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetProductCostLayers), new { productId = dto.ProductId }, result);
    }

    /// <summary>
    /// Consume from cost layers (when issuing inventory)
    /// </summary>
    [HttpPost("layers/consume")]
    [ProducesResponseType(typeof(CostCalculationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CostCalculationResultDto>> ConsumeFromCostLayers(
        [FromBody] CostCalculationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.ConsumeFromCostLayersAsync(request, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // PRODUCT COSTING ENDPOINTS
    // =====================================

    /// <summary>
    /// Get costing summary for a specific product
    /// </summary>
    [HttpGet("products/{productId}")]
    [ProducesResponseType(typeof(ProductCostingSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductCostingSummaryDto>> GetProductCostingSummary(
        int productId,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.GetProductCostingSummaryAsync(
            productId, warehouseId, cancellationToken);

        if (result == null)
            return NotFound($"Product with ID {productId} not found");

        return Ok(result);
    }

    /// <summary>
    /// Get costing summaries for multiple products
    /// </summary>
    [HttpGet("products")]
    [ProducesResponseType(typeof(List<ProductCostingSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductCostingSummaryDto>>> GetProductCostingSummaries(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.GetProductCostingSummariesAsync(
            categoryId, warehouseId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Calculate COGS for a quantity using specific method
    /// </summary>
    [HttpPost("calculate-cogs")]
    [ProducesResponseType(typeof(CostCalculationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CostCalculationResultDto>> CalculateCOGS(
        [FromBody] CostCalculationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _costingService.CalculateCOGSAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Compare costs across different methods
    /// </summary>
    [HttpGet("products/{productId}/compare")]
    [ProducesResponseType(typeof(CostMethodComparisonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CostMethodComparisonDto>> CompareCostMethods(
        int productId,
        [FromQuery] decimal quantity,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _costingService.CompareCostMethodsAsync(
                productId, quantity, warehouseId, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // =====================================
    // INVENTORY VALUATION ENDPOINTS
    // =====================================

    /// <summary>
    /// Generate inventory valuation report
    /// </summary>
    [HttpGet("valuation")]
    [ProducesResponseType(typeof(InventoryValuationReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<InventoryValuationReportDto>> GetInventoryValuation(
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] CostingMethod method = CostingMethod.WeightedAverageCost,
        [FromQuery] DateTime? asOfDate = null,
        [FromQuery] bool includeZeroQuantity = false,
        CancellationToken cancellationToken = default)
    {
        var filter = new InventoryValuationFilterDto
        {
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            Method = method,
            AsOfDate = asOfDate,
            IncludeZeroQuantity = includeZeroQuantity
        };

        var result = await _costingService.GetInventoryValuationAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get total inventory value
    /// </summary>
    [HttpGet("valuation/total")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetTotalInventoryValue(
        [FromQuery] CostingMethod method = CostingMethod.WeightedAverageCost,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var value = await _costingService.GetTotalInventoryValueAsync(
            method, warehouseId, cancellationToken);
        return Ok(new { totalValue = value, method = method.ToString(), currency = "TRY" });
    }

    // =====================================
    // COGS REPORTING ENDPOINTS
    // =====================================

    /// <summary>
    /// Generate COGS report for a period
    /// </summary>
    [HttpGet("cogs-report")]
    [ProducesResponseType(typeof(COGSReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<COGSReportDto>> GetCOGSReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] CostingMethod method = CostingMethod.WeightedAverageCost,
        CancellationToken cancellationToken = default)
    {
        var filter = new COGSReportFilterDto
        {
            StartDate = startDate,
            EndDate = endDate,
            CategoryId = categoryId,
            WarehouseId = warehouseId,
            Method = method
        };

        var result = await _costingService.GetCOGSReportAsync(filter, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // STANDARD COST MANAGEMENT ENDPOINTS
    // =====================================

    /// <summary>
    /// Set standard cost for a product
    /// </summary>
    [HttpPost("products/{productId}/standard-cost")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetStandardCost(
        int productId,
        [FromBody] SetStandardCostDto dto,
        CancellationToken cancellationToken = default)
    {
        dto.ProductId = productId;
        var result = await _costingService.SetStandardCostAsync(dto, cancellationToken);

        if (!result)
            return NotFound($"Product with ID {productId} not found");

        return Ok(new { message = "Standard cost updated successfully" });
    }

    /// <summary>
    /// Get cost variance analysis
    /// </summary>
    [HttpGet("variance-analysis")]
    [ProducesResponseType(typeof(List<CostVarianceAnalysisDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CostVarianceAnalysisDto>>> GetCostVarianceAnalysis(
        [FromQuery] int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.GetCostVarianceAnalysisAsync(categoryId, cancellationToken);
        return Ok(result);
    }

    // =====================================
    // COST ADJUSTMENT ENDPOINTS
    // =====================================

    /// <summary>
    /// Adjust cost for inventory
    /// </summary>
    [HttpPost("adjust")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AdjustCost(
        [FromBody] CostAdjustmentDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.AdjustCostAsync(dto, cancellationToken);

        if (!result)
            return BadRequest("Failed to adjust cost");

        return Ok(new { message = "Cost adjusted successfully" });
    }

    /// <summary>
    /// Recalculate weighted average cost for a product
    /// </summary>
    [HttpPost("products/{productId}/recalculate-wac")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> RecalculateWAC(
        int productId,
        [FromQuery] int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var wac = await _costingService.RecalculateWACAsync(productId, warehouseId, cancellationToken);
        return Ok(new { productId, weightedAverageCost = wac, currency = "TRY" });
    }

    // =====================================
    // COSTING METHOD CONFIGURATION ENDPOINTS
    // =====================================

    /// <summary>
    /// Get current costing method for a product
    /// </summary>
    [HttpGet("products/{productId}/method")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetProductCostingMethod(
        int productId,
        CancellationToken cancellationToken = default)
    {
        var method = await _costingService.GetProductCostingMethodAsync(productId, cancellationToken);
        return Ok(new { productId, costingMethod = method.ToString() });
    }

    /// <summary>
    /// Set costing method for a product
    /// </summary>
    [HttpPut("products/{productId}/method")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetProductCostingMethod(
        int productId,
        [FromBody] SetCostingMethodRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _costingService.SetProductCostingMethodAsync(
            productId, request.Method, cancellationToken);

        if (!result)
            return BadRequest("Failed to set costing method");

        return Ok(new { message = "Costing method updated successfully" });
    }

    /// <summary>
    /// Get supported costing methods
    /// </summary>
    [HttpGet("methods")]
    [ProducesResponseType(typeof(Dictionary<string, string>), StatusCodes.Status200OK)]
    public ActionResult<Dictionary<string, string>> GetCostingMethods()
    {
        var methods = _costingService.GetCostingMethods();
        return Ok(methods);
    }
}

/// <summary>
/// Request model for setting costing method
/// </summary>
public class SetCostingMethodRequest
{
    public CostingMethod Method { get; set; }
}
