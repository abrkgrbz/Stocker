using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Queries;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class PurchaseReturnsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PurchaseReturnsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPurchaseReturns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PurchaseReturnStatus? status = null,
        [FromQuery] PurchaseReturnType? type = null,
        [FromQuery] PurchaseReturnReason? reason = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetPurchaseReturnsQuery(
            page, pageSize, searchTerm, status, type, reason, supplierId,
            fromDate, toDate, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPurchaseReturn(Guid id)
    {
        var result = await _mediator.Send(new GetPurchaseReturnByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("number/{returnNumber}")]
    public async Task<IActionResult> GetPurchaseReturnByNumber(string returnNumber)
    {
        var result = await _mediator.Send(new GetPurchaseReturnByNumberQuery(returnNumber));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("rma/{rmaNumber}")]
    public async Task<IActionResult> GetPurchaseReturnByRma(string rmaNumber)
    {
        var result = await _mediator.Send(new GetPurchaseReturnByRmaQuery(rmaNumber));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("supplier/{supplierId:guid}")]
    public async Task<IActionResult> GetReturnsBySupplier(
        Guid supplierId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetPurchaseReturnsBySupplierQuery(supplierId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("purchase-order/{purchaseOrderId:guid}")]
    public async Task<IActionResult> GetReturnsByOrder(Guid purchaseOrderId)
    {
        var result = await _mediator.Send(new GetPurchaseReturnsByOrderQuery(purchaseOrderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingReturns()
    {
        var result = await _mediator.Send(new GetPendingPurchaseReturnsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetReturnSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetPurchaseReturnSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("returnable-items/{purchaseOrderId:guid}")]
    public async Task<IActionResult> GetReturnableItems(Guid purchaseOrderId)
    {
        var result = await _mediator.Send(new GetReturnableItemsQuery(purchaseOrderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePurchaseReturn([FromBody] CreatePurchaseReturnDto dto)
    {
        var result = await _mediator.Send(new CreatePurchaseReturnCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPurchaseReturn), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePurchaseReturn(Guid id, [FromBody] UpdatePurchaseReturnDto dto)
    {
        var result = await _mediator.Send(new UpdatePurchaseReturnCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreatePurchaseReturnItemDto item)
    {
        var result = await _mediator.Send(new AddPurchaseReturnItemCommand(id, item));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemovePurchaseReturnItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await _mediator.Send(new SubmitPurchaseReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _mediator.Send(new ApprovePurchaseReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectReturnRequest request)
    {
        var result = await _mediator.Send(new RejectPurchaseReturnCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/ship")]
    public async Task<IActionResult> Ship(Guid id, [FromBody] ShipReturnDto dto)
    {
        var result = await _mediator.Send(new ShipPurchaseReturnCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/mark-received")]
    public async Task<IActionResult> MarkReceived(Guid id)
    {
        var result = await _mediator.Send(new MarkReturnReceivedCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/process-refund")]
    public async Task<IActionResult> ProcessRefund(Guid id, [FromBody] ProcessRefundDto dto)
    {
        var result = await _mediator.Send(new ProcessReturnRefundCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var result = await _mediator.Send(new CompletePurchaseReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelReturnRequest request)
    {
        var result = await _mediator.Send(new CancelPurchaseReturnCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/rma")]
    public async Task<IActionResult> SetRmaNumber(Guid id, [FromBody] SetRmaRequest request)
    {
        var result = await _mediator.Send(new SetRmaNumberCommand(id, request.RmaNumber));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeletePurchaseReturnCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record RejectReturnRequest(string Reason);
public record CancelReturnRequest(string Reason);
public record SetRmaRequest(string RmaNumber);
