using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.SupplierPayments.Commands;
using Stocker.Modules.Purchase.Application.Features.SupplierPayments.Queries;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class SupplierPaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SupplierPaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSupplierPayments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] SupplierPaymentStatus? status = null,
        [FromQuery] SupplierPaymentType? type = null,
        [FromQuery] PaymentMethod? method = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isReconciled = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetSupplierPaymentsQuery(
            page, pageSize, searchTerm, status, type, method, supplierId,
            fromDate, toDate, isReconciled, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSupplierPayment(Guid id)
    {
        var result = await _mediator.Send(new GetSupplierPaymentByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("number/{paymentNumber}")]
    public async Task<IActionResult> GetSupplierPaymentByNumber(string paymentNumber)
    {
        var result = await _mediator.Send(new GetSupplierPaymentByNumberQuery(paymentNumber));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("supplier/{supplierId:guid}")]
    public async Task<IActionResult> GetPaymentsBySupplier(
        Guid supplierId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetSupplierPaymentsBySupplierQuery(supplierId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("invoice/{invoiceId:guid}")]
    public async Task<IActionResult> GetPaymentsByInvoice(Guid invoiceId)
    {
        var result = await _mediator.Send(new GetSupplierPaymentsByInvoiceQuery(invoiceId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending-approval")]
    public async Task<IActionResult> GetPendingApprovalPayments()
    {
        var result = await _mediator.Send(new GetPendingApprovalPaymentsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("unreconciled")]
    public async Task<IActionResult> GetUnreconciledPayments()
    {
        var result = await _mediator.Send(new GetUnreconciledPaymentsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetPaymentSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetSupplierPaymentSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupplierPayment([FromBody] CreateSupplierPaymentDto dto)
    {
        var result = await _mediator.Send(new CreateSupplierPaymentCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetSupplierPayment), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSupplierPayment(Guid id, [FromBody] UpdateSupplierPaymentDto dto)
    {
        var result = await _mediator.Send(new UpdateSupplierPaymentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await _mediator.Send(new SubmitSupplierPaymentCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApprovePaymentDto dto)
    {
        var result = await _mediator.Send(new ApproveSupplierPaymentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectPaymentDto dto)
    {
        var result = await _mediator.Send(new RejectSupplierPaymentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/process")]
    public async Task<IActionResult> Process(Guid id, [FromBody] ProcessPaymentDto dto)
    {
        var result = await _mediator.Send(new ProcessSupplierPaymentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var result = await _mediator.Send(new CompleteSupplierPaymentCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelPaymentRequest request)
    {
        var result = await _mediator.Send(new CancelSupplierPaymentCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reverse")]
    public async Task<IActionResult> Reverse(Guid id, [FromBody] ReversePaymentRequest request)
    {
        var result = await _mediator.Send(new ReverseSupplierPaymentCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reconcile")]
    public async Task<IActionResult> Reconcile(Guid id, [FromBody] ReconcilePaymentDto dto)
    {
        var result = await _mediator.Send(new ReconcileSupplierPaymentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/link-invoice")]
    public async Task<IActionResult> LinkToInvoice(Guid id, [FromBody] LinkInvoiceRequest request)
    {
        var result = await _mediator.Send(new LinkPaymentToInvoiceCommand(id, request.InvoiceId, request.InvoiceNumber));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteSupplierPaymentCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record CancelPaymentRequest(string Reason);
public record ReversePaymentRequest(string Reason);
public record LinkInvoiceRequest(Guid InvoiceId, string? InvoiceNumber);
