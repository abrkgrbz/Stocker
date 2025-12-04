using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;
using Stocker.Modules.Inventory.Application.Features.StockTransfers.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/stock-transfers")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class StockTransfersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public StockTransfersController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all stock transfers with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<StockTransferListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<StockTransferListDto>>> GetStockTransfers(
        [FromQuery] int? sourceWarehouseId = null,
        [FromQuery] int? destinationWarehouseId = null,
        [FromQuery] TransferStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockTransfersQuery
        {
            TenantId = tenantId.Value,
            SourceWarehouseId = sourceWarehouseId,
            DestinationWarehouseId = destinationWarehouseId,
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
    /// Get stock transfer by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(StockTransferDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockTransferDto>> GetStockTransfer(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockTransferByIdQuery
        {
            TenantId = tenantId.Value,
            TransferId = id
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
    /// Create a new stock transfer
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StockTransferDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<StockTransferDto>> CreateStockTransfer([FromBody] CreateStockTransferDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateStockTransferCommand
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

        return CreatedAtAction(nameof(GetStockTransfer), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Submit a stock transfer for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> SubmitStockTransfer(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new SubmitStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id
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
    /// Approve a stock transfer
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ApproveStockTransfer(int id, [FromBody] ApproveTransferRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ApproveStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id,
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
    /// Ship a stock transfer
    /// </summary>
    [HttpPost("{id}/ship")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ShipStockTransfer(int id, [FromBody] ShipTransferRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ShipStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id,
            ShippedByUserId = request.ShippedByUserId
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
    /// Receive a stock transfer
    /// </summary>
    [HttpPost("{id}/receive")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ReceiveStockTransfer(int id, [FromBody] ReceiveTransferRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ReceiveStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id,
            ReceivedByUserId = request.ReceivedByUserId
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
    /// Cancel a stock transfer
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CancelStockTransfer(int id, [FromBody] CancelTransferRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CancelStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id,
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
    /// Update a stock transfer (draft only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(StockTransferDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockTransferDto>> UpdateStockTransfer(int id, [FromBody] UpdateStockTransferDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id,
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
    /// Reject a stock transfer
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RejectStockTransfer(int id, [FromBody] RejectTransferRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new RejectStockTransferCommand
        {
            TenantId = tenantId.Value,
            TransferId = id,
            RejectedByUserId = request.RejectedByUserId,
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

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}

public class ApproveTransferRequest
{
    public int ApprovedByUserId { get; set; }
}

public class ShipTransferRequest
{
    public int ShippedByUserId { get; set; }
}

public class ReceiveTransferRequest
{
    public int ReceivedByUserId { get; set; }
}

public class CancelTransferRequest
{
    public string? Reason { get; set; }
}

public class RejectTransferRequest
{
    public int RejectedByUserId { get; set; }
    public string? Reason { get; set; }
}
