using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Payments.Commands;
using Stocker.Modules.Sales.Application.Features.Payments.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/payments")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all payments with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<PaymentListDto>>> GetPayments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] string? method = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? invoiceId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = "PaymentDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPaymentsQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            Method = method,
            CustomerId = customerId,
            InvoiceId = invoiceId,
            FromDate = fromDate,
            ToDate = toDate,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a payment by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PaymentDto>> GetPaymentById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetPaymentByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets payments for an invoice
    /// </summary>
    [HttpGet("by-invoice/{invoiceId:guid}")]
    public async Task<ActionResult<List<PaymentDto>>> GetPaymentsByInvoice(Guid invoiceId, CancellationToken cancellationToken)
    {
        var query = new GetPaymentsByInvoiceQuery { InvoiceId = invoiceId };
        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets payment statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<PaymentStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPaymentStatisticsQuery
        {
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new payment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PaymentDto>> CreatePayment(
        [FromBody] CreatePaymentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetPaymentById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Updates a payment
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PaymentDto>> UpdatePayment(
        Guid id,
        [FromBody] UpdatePaymentCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Confirms a payment
    /// </summary>
    [HttpPost("{id:guid}/confirm")]
    public async Task<ActionResult<PaymentDto>> ConfirmPayment(Guid id, CancellationToken cancellationToken)
    {
        var command = new ConfirmPaymentCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Completes a payment
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<PaymentDto>> CompletePayment(Guid id, CancellationToken cancellationToken)
    {
        var command = new CompletePaymentCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Rejects a payment
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<PaymentDto>> RejectPayment(
        Guid id,
        [FromBody] RejectPaymentCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Refunds a payment
    /// </summary>
    [HttpPost("{id:guid}/refund")]
    public async Task<ActionResult<PaymentDto>> RefundPayment(
        Guid id,
        [FromBody] RefundPaymentCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch" });

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Deletes a payment
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeletePayment(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeletePaymentCommand { Id = id };
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Error.Code == "NotFound")
                return NotFound(new { error = result.Error.Description });
            return BadRequest(new { error = result.Error.Description });
        }

        return NoContent();
    }
}
