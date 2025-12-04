using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.StockMovements.Commands;
using Stocker.Modules.Inventory.Application.Features.StockMovements.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/stock-movements")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class StockMovementsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public StockMovementsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all stock movements with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<StockMovementListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<StockMovementListDto>>> GetStockMovements(
        [FromQuery] int? productId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] StockMovementType? movementType = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockMovementsQuery
        {
            TenantId = tenantId.Value,
            ProductId = productId,
            WarehouseId = warehouseId,
            MovementType = movementType,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get stock movement by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(StockMovementDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockMovementDto>> GetStockMovement(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockMovementByIdQuery
        {
            TenantId = tenantId.Value,
            MovementId = id
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new stock movement
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StockMovementDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<StockMovementDto>> CreateStockMovement([FromBody] CreateStockMovementDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateStockMovementCommand
        {
            TenantId = tenantId.Value,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetStockMovement), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Reverse a stock movement
    /// </summary>
    [HttpPost("{id}/reverse")]
    [ProducesResponseType(typeof(int), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> ReverseStockMovement(int id, [FromBody] ReverseMovementRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ReverseStockMovementCommand
        {
            TenantId = tenantId.Value,
            MovementId = id,
            UserId = request.UserId,
            Description = request.Description
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get stock movement summary for a period
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(StockMovementSummaryDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockMovementSummaryDto>> GetStockMovementSummary(
        [FromQuery] int? warehouseId = null,
        [FromQuery] int? productId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockMovementSummaryQuery
        {
            TenantId = tenantId.Value,
            WarehouseId = warehouseId,
            ProductId = productId,
            FromDate = fromDate,
            ToDate = toDate
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

public class ReverseMovementRequest
{
    public int UserId { get; set; }
    public string? Description { get; set; }
}
