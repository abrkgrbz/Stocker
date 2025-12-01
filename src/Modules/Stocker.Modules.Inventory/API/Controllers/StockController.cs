using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.Stock.Commands;
using Stocker.Modules.Inventory.Application.Features.Stock.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/stock")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class StockController : ControllerBase
{
    private readonly IMediator _mediator;

    public StockController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get stock levels
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<StockDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<StockDto>>> GetStock(
        [FromQuery] int? warehouseId = null,
        [FromQuery] int? productId = null,
        [FromQuery] int? locationId = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetStockQuery
        {
            TenantId = tenantId,
            WarehouseId = warehouseId,
            ProductId = productId,
            LocationId = locationId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get stock summary for a product
    /// </summary>
    [HttpGet("summary/{productId}")]
    [ProducesResponseType(typeof(ProductStockSummaryDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductStockSummaryDto>> GetProductStockSummary(int productId)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductStockSummaryQuery
        {
            TenantId = tenantId,
            ProductId = productId
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
    /// Get stock movements
    /// </summary>
    [HttpGet("movements")]
    [ProducesResponseType(typeof(List<StockMovementDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<StockMovementDto>>> GetStockMovements(
        [FromQuery] int? productId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] StockMovementType? movementType = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? take = 100)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetStockMovementsQuery
        {
            TenantId = tenantId,
            ProductId = productId,
            WarehouseId = warehouseId,
            MovementType = movementType,
            StartDate = startDate,
            EndDate = endDate,
            Take = take
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Adjust stock quantity
    /// </summary>
    [HttpPost("adjust")]
    [ProducesResponseType(typeof(StockDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockDto>> AdjustStock(StockAdjustmentDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new AdjustStockCommand
        {
            TenantId = tenantId,
            AdjustmentData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Move stock between warehouses/locations
    /// </summary>
    [HttpPost("move")]
    [ProducesResponseType(typeof(StockMovementDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockMovementDto>> MoveStock(StockMoveDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new MoveStockCommand
        {
            TenantId = tenantId,
            MoveData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    private int GetTenantId()
    {
        if (HttpContext.Items["TenantId"] is int tenantId)
            return tenantId;
        if (HttpContext.Items["TenantId"] is Guid guidTenantId)
            return guidTenantId.GetHashCode();
        return 0;
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
