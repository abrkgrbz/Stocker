using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Queries;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class PurchaseInvoicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PurchaseInvoicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPurchaseInvoices(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PurchaseInvoiceStatus? status = null,
        [FromQuery] PurchaseInvoiceType? type = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] DateTime? dueDateFrom = null,
        [FromQuery] DateTime? dueDateTo = null,
        [FromQuery] bool? isOverdue = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetPurchaseInvoicesQuery(
            page, pageSize, searchTerm, status, type, supplierId,
            fromDate, toDate, dueDateFrom, dueDateTo, isOverdue, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPurchaseInvoice(Guid id)
    {
        var result = await _mediator.Send(new GetPurchaseInvoiceByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("number/{invoiceNumber}")]
    public async Task<IActionResult> GetPurchaseInvoiceByNumber(string invoiceNumber)
    {
        var result = await _mediator.Send(new GetPurchaseInvoiceByNumberQuery(invoiceNumber));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("supplier/{supplierId:guid}")]
    public async Task<IActionResult> GetInvoicesBySupplier(
        Guid supplierId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetPurchaseInvoicesBySupplierQuery(supplierId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("purchase-order/{purchaseOrderId:guid}")]
    public async Task<IActionResult> GetInvoicesByPurchaseOrder(Guid purchaseOrderId)
    {
        var result = await _mediator.Send(new GetPurchaseInvoicesByPurchaseOrderQuery(purchaseOrderId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingInvoices()
    {
        var result = await _mediator.Send(new GetPendingPurchaseInvoicesQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdueInvoices()
    {
        var result = await _mediator.Send(new GetOverduePurchaseInvoicesQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("unpaid")]
    public async Task<IActionResult> GetUnpaidInvoices([FromQuery] Guid? supplierId = null)
    {
        var result = await _mediator.Send(new GetUnpaidPurchaseInvoicesQuery(supplierId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetInvoiceSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetPurchaseInvoiceSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePurchaseInvoice([FromBody] CreatePurchaseInvoiceDto dto)
    {
        var result = await _mediator.Send(new CreatePurchaseInvoiceCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPurchaseInvoice), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePurchaseInvoice(Guid id, [FromBody] UpdatePurchaseInvoiceDto dto)
    {
        var result = await _mediator.Send(new UpdatePurchaseInvoiceCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreatePurchaseInvoiceItemDto item)
    {
        var result = await _mediator.Send(new AddPurchaseInvoiceItemCommand(id, item));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemovePurchaseInvoiceItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await _mediator.Send(new SubmitPurchaseInvoiceCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _mediator.Send(new ApprovePurchaseInvoiceCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectInvoiceRequest request)
    {
        var result = await _mediator.Send(new RejectPurchaseInvoiceCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/record-payment")]
    public async Task<IActionResult> RecordPayment(Guid id, [FromBody] RecordPaymentDto dto)
    {
        var result = await _mediator.Send(new RecordInvoicePaymentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkAsPaid(Guid id)
    {
        var result = await _mediator.Send(new MarkInvoiceAsPaidCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelInvoiceRequest request)
    {
        var result = await _mediator.Send(new CancelPurchaseInvoiceCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/e-invoice")]
    public async Task<IActionResult> SetEInvoiceInfo(Guid id, [FromBody] SetEInvoiceInfoRequest request)
    {
        var result = await _mediator.Send(new SetEInvoiceInfoCommand(id, request.EInvoiceId, request.EInvoiceUUID));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeletePurchaseInvoiceCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record RejectInvoiceRequest(string Reason);
public record CancelInvoiceRequest(string Reason);
public record SetEInvoiceInfoRequest(string EInvoiceId, string EInvoiceUUID);
