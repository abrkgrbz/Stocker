using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;
using Stocker.Modules.Inventory.Application.Features.StockCounts.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/stock-counts")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class StockCountsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public StockCountsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all stock counts with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<StockCountListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<StockCountListDto>>> GetStockCounts(
        [FromQuery] int? warehouseId = null,
        [FromQuery] StockCountStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockCountsQuery
        {
            TenantId = tenantId.Value,
            WarehouseId = warehouseId,
            Status = status,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get stock count by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(StockCountDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockCountDto>> GetStockCount(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockCountByIdQuery
        {
            TenantId = tenantId.Value,
            StockCountId = id
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
    /// Create a new stock count
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StockCountDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<StockCountDto>> CreateStockCount([FromBody] CreateStockCountDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateStockCountCommand
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

        return CreatedAtAction(nameof(GetStockCount), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Start a stock count
    /// </summary>
    [HttpPost("{id}/start")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> StartStockCount(int id, [FromBody] StartCountRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new StartStockCountCommand
        {
            TenantId = tenantId.Value,
            StockCountId = id,
            CountedByUserId = request.CountedByUserId
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Record a count for an item
    /// </summary>
    [HttpPost("{id}/items/{itemId}/count")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CountItem(int id, int itemId, [FromBody] CountItemRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CountItemCommand
        {
            TenantId = tenantId.Value,
            StockCountId = id,
            ItemId = itemId,
            CountedQuantity = request.CountedQuantity,
            Notes = request.Notes
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Complete a stock count
    /// </summary>
    [HttpPost("{id}/complete")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CompleteStockCount(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CompleteStockCountCommand
        {
            TenantId = tenantId.Value,
            StockCountId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Approve a stock count
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ApproveStockCount(int id, [FromBody] ApproveCountRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ApproveStockCountCommand
        {
            TenantId = tenantId.Value,
            StockCountId = id,
            ApprovedByUserId = request.ApprovedByUserId
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Cancel a stock count
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CancelStockCount(int id, [FromBody] CancelCountRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CancelStockCountCommand
        {
            TenantId = tenantId.Value,
            StockCountId = id,
            Reason = request?.Reason
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Update a stock count (draft or in-progress only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(StockCountDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockCountDto>> UpdateStockCount(int id, [FromBody] UpdateStockCountDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateStockCountCommand
        {
            TenantId = tenantId.Value,
            StockCountId = id,
            Data = data
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
    /// Get stock count summary/report
    /// </summary>
    [HttpGet("{id}/summary")]
    [ProducesResponseType(typeof(StockCountSummaryDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockCountSummaryDto>> GetStockCountSummary(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockCountSummaryQuery
        {
            TenantId = tenantId.Value,
            StockCountId = id
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

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}

public class StartCountRequest
{
    public int CountedByUserId { get; set; }
}

public class CountItemRequest
{
    public decimal CountedQuantity { get; set; }
    public string? Notes { get; set; }
}

public class ApproveCountRequest
{
    public int ApprovedByUserId { get; set; }
}

public class CancelCountRequest
{
    public string? Reason { get; set; }
}
