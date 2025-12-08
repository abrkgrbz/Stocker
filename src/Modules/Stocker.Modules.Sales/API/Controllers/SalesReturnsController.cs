using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesReturns.Commands;
using Stocker.Modules.Sales.Application.Features.SalesReturns.Queries;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class SalesReturnsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesReturnsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSalesReturns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] SalesReturnStatus? status = null,
        [FromQuery] SalesReturnReason? reason = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetSalesReturnsQuery(
            page, pageSize, searchTerm, status, reason, customerId,
            fromDate, toDate, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSalesReturn(Guid id)
    {
        var result = await _mediator.Send(new GetSalesReturnByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("order/{orderId:guid}")]
    public async Task<IActionResult> GetReturnsByOrder(Guid orderId)
    {
        var result = await _mediator.Send(new GetSalesReturnsByOrderQuery(orderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<IActionResult> GetReturnsByCustomer(
        Guid customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetSalesReturnsByCustomerQuery(customerId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingReturns()
    {
        var result = await _mediator.Send(new GetPendingReturnsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetReturnSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetReturnSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("returnable-items/{orderId:guid}")]
    public async Task<IActionResult> GetReturnableItems(Guid orderId)
    {
        var result = await _mediator.Send(new GetReturnableItemsQuery(orderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSalesReturn([FromBody] CreateSalesReturnDto dto)
    {
        var result = await _mediator.Send(new CreateSalesReturnCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetSalesReturn), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSalesReturn(Guid id, [FromBody] UpdateSalesReturnDto dto)
    {
        var result = await _mediator.Send(new UpdateSalesReturnCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreateSalesReturnItemDto item)
    {
        var result = await _mediator.Send(new AddSalesReturnItemCommand(id, item));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemoveSalesReturnItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await _mediator.Send(new SubmitSalesReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _mediator.Send(new ApproveSalesReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectReturnRequest request)
    {
        var result = await _mediator.Send(new RejectSalesReturnCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id)
    {
        var result = await _mediator.Send(new ReceiveSalesReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/process-refund")]
    public async Task<IActionResult> ProcessRefund(Guid id, [FromBody] ProcessRefundDto dto)
    {
        var result = await _mediator.Send(new ProcessRefundCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var result = await _mediator.Send(new CompleteSalesReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelReturnRequest request)
    {
        var result = await _mediator.Send(new CancelSalesReturnCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items/{itemId:guid}/mark-restocked")]
    public async Task<IActionResult> MarkItemAsRestocked(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new MarkItemAsRestockedCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/mark-restocked")]
    public async Task<IActionResult> MarkAsRestocked(Guid id)
    {
        var result = await _mediator.Send(new MarkReturnAsRestockedCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteSalesReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record RejectReturnRequest(string Reason);
public record CancelReturnRequest(string Reason);
