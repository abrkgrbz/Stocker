using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;
using Stocker.Modules.Inventory.Application.Features.LotBatches.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/lot-batches")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class LotBatchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public LotBatchesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all lot batches with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<LotBatchListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LotBatchListDto>>> GetLotBatches(
        [FromQuery] int? productId = null,
        [FromQuery] LotBatchStatus? status = null,
        [FromQuery] bool expiredOnly = false,
        [FromQuery] int? expiringWithinDays = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetLotBatchesQuery
        {
            TenantId = tenantId,
            ProductId = productId,
            Status = status,
            ExpiredOnly = expiredOnly,
            ExpiringWithinDays = expiringWithinDays
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get lot batch by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LotBatchDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<LotBatchDto>> GetLotBatch(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetLotBatchByIdQuery
        {
            TenantId = tenantId,
            LotBatchId = id
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
    /// Create a new lot batch
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LotBatchDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<LotBatchDto>> CreateLotBatch([FromBody] CreateLotBatchDto data)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new CreateLotBatchCommand
        {
            TenantId = tenantId,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(result.Error);
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetLotBatch), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Approve a lot batch
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ApproveLotBatch(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new ApproveLotBatchCommand
        {
            TenantId = tenantId,
            LotBatchId = id
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
    /// Quarantine a lot batch
    /// </summary>
    [HttpPost("{id}/quarantine")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> QuarantineLotBatch(int id, [FromBody] QuarantineRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new QuarantineLotBatchCommand
        {
            TenantId = tenantId,
            LotBatchId = id,
            Reason = request.Reason
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

public class QuarantineRequest
{
    public string Reason { get; set; } = string.Empty;
}
