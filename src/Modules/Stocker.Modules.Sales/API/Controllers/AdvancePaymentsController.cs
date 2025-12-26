using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.AdvancePayments.Commands;
using Stocker.Modules.Sales.Application.Features.AdvancePayments.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/advance-payments")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class AdvancePaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdvancePaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all advance payments with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdvancePaymentListDto>>> GetAdvancePayments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? salesOrderId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isCaptured = null,
        [FromQuery] string? sortBy = "PaymentDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAdvancePaymentsQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            CustomerId = customerId,
            SalesOrderId = salesOrderId,
            FromDate = fromDate,
            ToDate = toDate,
            IsCaptured = isCaptured,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets an advance payment by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdvancePaymentDto>> GetAdvancePaymentById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetAdvancePaymentByIdQuery { Id = id };
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
    /// Gets advance payment statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<AdvancePaymentStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAdvancePaymentStatisticsQuery
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
    /// Creates a new advance payment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AdvancePaymentDto>> CreateAdvancePayment(
        [FromBody] CreateAdvancePaymentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetAdvancePaymentById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Captures an advance payment
    /// </summary>
    [HttpPost("{id:guid}/capture")]
    public async Task<ActionResult<AdvancePaymentDto>> CaptureAdvancePayment(Guid id, CancellationToken cancellationToken)
    {
        var command = new CaptureAdvancePaymentCommand { Id = id };
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
    /// Applies an advance payment to an invoice
    /// </summary>
    [HttpPost("{id:guid}/apply")]
    public async Task<ActionResult<AdvancePaymentDto>> ApplyAdvancePayment(
        Guid id,
        [FromBody] ApplyAdvancePaymentCommand command,
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
    /// Refunds an advance payment
    /// </summary>
    [HttpPost("{id:guid}/refund")]
    public async Task<ActionResult<AdvancePaymentDto>> RefundAdvancePayment(
        Guid id,
        [FromBody] RefundAdvancePaymentCommand command,
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
    /// Cancels an advance payment
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<AdvancePaymentDto>> CancelAdvancePayment(
        Guid id,
        [FromBody] CancelAdvancePaymentCommand command,
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
    /// Deletes an advance payment
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteAdvancePayment(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteAdvancePaymentCommand { Id = id };
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
