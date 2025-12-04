using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;
using Stocker.Modules.Inventory.Application.Features.StockReservations.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/stock-reservations")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class StockReservationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public StockReservationsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all stock reservations with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<StockReservationListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<StockReservationListDto>>> GetStockReservations(
        [FromQuery] int? productId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] ReservationStatus? status = null,
        [FromQuery] bool expiredOnly = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockReservationsQuery
        {
            TenantId = tenantId.Value,
            ProductId = productId,
            WarehouseId = warehouseId,
            Status = status,
            ExpiredOnly = expiredOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get stock reservation by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(StockReservationDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<StockReservationDto>> GetStockReservation(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetStockReservationByIdQuery
        {
            TenantId = tenantId.Value,
            ReservationId = id
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
    /// Create a new stock reservation
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(StockReservationDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<StockReservationDto>> CreateStockReservation([FromBody] CreateStockReservationDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateStockReservationCommand
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

        return CreatedAtAction(nameof(GetStockReservation), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Fulfill a stock reservation (fully or partially)
    /// </summary>
    [HttpPost("{id}/fulfill")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> FulfillStockReservation(int id, [FromBody] FulfillReservationRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new FulfillStockReservationCommand
        {
            TenantId = tenantId.Value,
            ReservationId = id,
            Quantity = request?.Quantity
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
    /// Cancel a stock reservation
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CancelStockReservation(int id, [FromBody] CancelReservationRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CancelStockReservationCommand
        {
            TenantId = tenantId.Value,
            ReservationId = id,
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
    /// Extend reservation expiration date
    /// </summary>
    [HttpPost("{id}/extend")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ExtendReservation(int id, [FromBody] ExtendReservationRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ExtendReservationExpirationCommand
        {
            TenantId = tenantId.Value,
            ReservationId = id,
            NewExpirationDate = request.NewExpirationDate
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

public class FulfillReservationRequest
{
    public decimal? Quantity { get; set; }
}

public class CancelReservationRequest
{
    public string? Reason { get; set; }
}

public class ExtendReservationRequest
{
    public DateTime NewExpirationDate { get; set; }
}
