using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.Features.Analytics.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.Modules.Inventory.Infrastructure.RateLimiting;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/analytics")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
[InventoryRateLimit(InventoryRateLimitPolicies.AnalyticsLimit, policyName: "analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public AnalyticsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get comprehensive inventory dashboard data
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(InventoryDashboardDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InventoryDashboardDto>> GetDashboard()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetInventoryDashboardQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get stock valuation report
    /// </summary>
    [HttpGet("valuation")]
    [ProducesResponseType(typeof(StockValuationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockValuationDto>> GetStockValuation(
        [FromQuery] int? warehouseId = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] DateTime? asOfDate = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockValuationQuery
        {
            TenantId = tenantId.Value,
            WarehouseId = warehouseId,
            CategoryId = categoryId,
            AsOfDate = asOfDate
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get inventory KPIs for a specific period
    /// </summary>
    [HttpGet("kpis")]
    [ProducesResponseType(typeof(InventoryKPIsDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<InventoryKPIsDto>> GetKPIs(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? warehouseId = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetInventoryKPIsQuery
        {
            TenantId = tenantId.Value,
            StartDate = startDate ?? DateTime.UtcNow.AddDays(-30),
            EndDate = endDate ?? DateTime.UtcNow,
            WarehouseId = warehouseId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
