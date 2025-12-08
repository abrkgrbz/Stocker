using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Commands;
using Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Queries;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class GoodsReceiptsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GoodsReceiptsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetGoodsReceipts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] GoodsReceiptStatus? status = null,
        [FromQuery] GoodsReceiptType? type = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] Guid? purchaseOrderId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetGoodsReceiptsQuery(
            page, pageSize, searchTerm, status, type, supplierId, warehouseId, purchaseOrderId,
            fromDate, toDate, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetGoodsReceipt(Guid id)
    {
        var result = await _mediator.Send(new GetGoodsReceiptByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("number/{receiptNumber}")]
    public async Task<IActionResult> GetGoodsReceiptByNumber(string receiptNumber)
    {
        var result = await _mediator.Send(new GetGoodsReceiptByNumberQuery(receiptNumber));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("purchase-order/{purchaseOrderId:guid}")]
    public async Task<IActionResult> GetReceiptsByPurchaseOrder(Guid purchaseOrderId)
    {
        var result = await _mediator.Send(new GetGoodsReceiptsByPurchaseOrderQuery(purchaseOrderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("supplier/{supplierId:guid}")]
    public async Task<IActionResult> GetReceiptsBySupplier(
        Guid supplierId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetGoodsReceiptsBySupplierQuery(supplierId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending-quality-check")]
    public async Task<IActionResult> GetPendingQualityCheck()
    {
        var result = await _mediator.Send(new GetPendingQualityCheckQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetReceiptSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetGoodsReceiptSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateGoodsReceipt([FromBody] CreateGoodsReceiptDto dto)
    {
        var result = await _mediator.Send(new CreateGoodsReceiptCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetGoodsReceipt), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateGoodsReceipt(Guid id, [FromBody] UpdateGoodsReceiptDto dto)
    {
        var result = await _mediator.Send(new UpdateGoodsReceiptCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreateGoodsReceiptItemDto item)
    {
        var result = await _mediator.Send(new AddGoodsReceiptItemCommand(id, item));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemoveGoodsReceiptItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await _mediator.Send(new SubmitGoodsReceiptCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/quality-check")]
    public async Task<IActionResult> PerformQualityCheck(Guid id, [FromBody] QualityCheckDto dto)
    {
        var result = await _mediator.Send(new PerformQualityCheckCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _mediator.Send(new ApproveGoodsReceiptCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var result = await _mediator.Send(new CompleteGoodsReceiptCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectReceiptRequest request)
    {
        var result = await _mediator.Send(new RejectGoodsReceiptCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelReceiptRequest request)
    {
        var result = await _mediator.Send(new CancelGoodsReceiptCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteGoodsReceiptCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record RejectReceiptRequest(string Reason);
public record CancelReceiptRequest(string Reason);
