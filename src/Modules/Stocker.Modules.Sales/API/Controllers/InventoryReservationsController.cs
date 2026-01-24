using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.InventoryReservations.Commands;
using Stocker.Modules.Sales.Application.Features.InventoryReservations.Queries;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class InventoryReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InventoryReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetReservations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] Guid? salesOrderId = null)
    {
        var result = await _mediator.Send(new GetReservationsPagedQuery(page, pageSize, status, type, productId, warehouseId, salesOrderId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetReservation(Guid id)
    {
        var result = await _mediator.Send(new GetReservationByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-number/{number}")]
    public async Task<IActionResult> GetReservationByNumber(string number)
    {
        var result = await _mediator.Send(new GetReservationByNumberQuery(number));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet("by-product/{productId:guid}")]
    public async Task<IActionResult> GetReservationsByProduct(Guid productId)
    {
        var result = await _mediator.Send(new GetReservationsByProductQuery(productId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("by-sales-order/{salesOrderId:guid}")]
    public async Task<IActionResult> GetReservationsBySalesOrder(Guid salesOrderId)
    {
        var result = await _mediator.Send(new GetReservationsBySalesOrderQuery(salesOrderId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("active/by-product/{productId:guid}")]
    public async Task<IActionResult> GetActiveReservationsByProduct(Guid productId)
    {
        var result = await _mediator.Send(new GetActiveReservationsByProductQuery(productId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("expired")]
    public async Task<IActionResult> GetExpiredReservations()
    {
        var result = await _mediator.Send(new GetExpiredReservationsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("total-reserved/{productId:guid}")]
    public async Task<IActionResult> GetTotalReservedQuantity(Guid productId, [FromQuery] Guid? warehouseId = null)
    {
        var result = await _mediator.Send(new GetTotalReservedQuantityQuery(productId, warehouseId));
        return result.IsSuccess ? Ok(new { totalReserved = result.Value }) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
    {
        var result = await _mediator.Send(new CreateReservationCommand(dto));
        return result.IsSuccess ? CreatedAtAction(nameof(GetReservation), new { id = result.Value.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/allocate")]
    public async Task<IActionResult> Allocate(Guid id, [FromBody] AllocateReservationDto dto)
    {
        var result = await _mediator.Send(new AllocateReservationCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/release")]
    public async Task<IActionResult> Release(Guid id, [FromBody] ReleaseReservationDto? dto = null)
    {
        var result = await _mediator.Send(new ReleaseReservationCommand(id, dto));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/partial-release")]
    public async Task<IActionResult> PartialRelease(Guid id, [FromQuery] decimal quantity, [FromQuery] string? reason = null)
    {
        var result = await _mediator.Send(new PartialReleaseReservationCommand(id, quantity, reason));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/extend")]
    public async Task<IActionResult> Extend(Guid id, [FromBody] ExtendReservationDto dto)
    {
        var result = await _mediator.Send(new ExtendReservationCommand(id, dto));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/fulfill")]
    public async Task<IActionResult> Fulfill(Guid id)
    {
        var result = await _mediator.Send(new FulfillReservationCommand(id));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/expire")]
    public async Task<IActionResult> Expire(Guid id)
    {
        var result = await _mediator.Send(new ExpireReservationCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }

    [HttpPost("expire-overdue")]
    public async Task<IActionResult> ExpireAllOverdue()
    {
        var result = await _mediator.Send(new ExpireAllOverdueReservationsCommand());
        return result.IsSuccess ? Ok(new { expiredCount = result.Value }) : BadRequest(result.Error);
    }
}
