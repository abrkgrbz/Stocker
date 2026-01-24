using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.DeliveryNotes.Commands;
using Stocker.Modules.Sales.Application.Features.DeliveryNotes.Queries;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class DeliveryNotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DeliveryNotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetDeliveryNotes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] DeliveryNoteStatus? status = null,
        [FromQuery] DeliveryNoteType? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var query = new GetDeliveryNotesQuery(page, pageSize, searchTerm, status, type, fromDate, toDate, sortBy, sortDescending);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDeliveryNote(Guid id)
    {
        var result = await _mediator.Send(new GetDeliveryNoteByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("number/{number}")]
    public async Task<IActionResult> GetDeliveryNoteByNumber(string number)
    {
        var result = await _mediator.Send(new GetDeliveryNoteByNumberQuery(number));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("sales-order/{salesOrderId:guid}")]
    public async Task<IActionResult> GetDeliveryNotesBySalesOrder(Guid salesOrderId)
    {
        var result = await _mediator.Send(new GetDeliveryNotesBySalesOrderQuery(salesOrderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("receiver/{receiverId:guid}")]
    public async Task<IActionResult> GetDeliveryNotesByReceiver(Guid receiverId)
    {
        var result = await _mediator.Send(new GetDeliveryNotesByReceiverQuery(receiverId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetDeliveryNotesByStatus(DeliveryNoteStatus status)
    {
        var result = await _mediator.Send(new GetDeliveryNotesByStatusQuery(status));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDeliveryNote([FromBody] CreateDeliveryNoteDto dto)
    {
        var result = await _mediator.Send(new CreateDeliveryNoteCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetDeliveryNote), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> ApproveDeliveryNote(Guid id)
    {
        var result = await _mediator.Send(new ApproveDeliveryNoteCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/dispatch")]
    public async Task<IActionResult> DispatchDeliveryNote(Guid id, [FromBody] DispatchDeliveryNoteDto dto)
    {
        var result = await _mediator.Send(new DispatchDeliveryNoteCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/deliver")]
    public async Task<IActionResult> DeliverDeliveryNote(Guid id, [FromBody] DeliverDeliveryNoteDto dto)
    {
        var result = await _mediator.Send(new DeliverDeliveryNoteCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> CancelDeliveryNote(Guid id, [FromBody] CancelDeliveryNoteDto dto)
    {
        var result = await _mediator.Send(new CancelDeliveryNoteCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    [HttpPut("{id:guid}/print")]
    public async Task<IActionResult> PrintDeliveryNote(Guid id)
    {
        var result = await _mediator.Send(new PrintDeliveryNoteCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreateDeliveryNoteItemDto dto)
    {
        var result = await _mediator.Send(new AddDeliveryNoteItemCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/link-invoice")]
    public async Task<IActionResult> LinkInvoice(Guid id, [FromQuery] Guid invoiceId, [FromQuery] string invoiceNumber)
    {
        var result = await _mediator.Send(new LinkInvoiceCommand(id, invoiceId, invoiceNumber));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}
