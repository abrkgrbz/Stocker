using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CreditNotes.Commands;
using Stocker.Modules.Sales.Application.Features.CreditNotes.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.Sales.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/credit-notes")]
[RequireModule("Sales")]
[ApiExplorerSettings(GroupName = "sales")]
public class CreditNotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CreditNotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all credit notes with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<CreditNoteListDto>>> GetCreditNotes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? status = null,
        [FromQuery] string? type = null,
        [FromQuery] string? reason = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? invoiceId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isApproved = null,
        [FromQuery] string? sortBy = "CreditNoteDate",
        [FromQuery] bool sortDescending = true,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCreditNotesQuery
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Status = status,
            Type = type,
            Reason = reason,
            CustomerId = customerId,
            InvoiceId = invoiceId,
            FromDate = fromDate,
            ToDate = toDate,
            IsApproved = isApproved,
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a credit note by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CreditNoteDto>> GetCreditNoteById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetCreditNoteByIdQuery { Id = id };
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
    /// Gets credit note statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<CreditNoteStatisticsDto>> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCreditNoteStatisticsQuery
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
    /// Creates a new credit note
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreditNoteDto>> CreateCreditNote(
        [FromBody] CreateCreditNoteCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error.Description });

        return CreatedAtAction(nameof(GetCreditNoteById), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Submits a credit note for approval
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<CreditNoteDto>> SubmitCreditNote(Guid id, CancellationToken cancellationToken)
    {
        var command = new SubmitCreditNoteCommand { Id = id };
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
    /// Approves a credit note
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    public async Task<ActionResult<CreditNoteDto>> ApproveCreditNote(Guid id, CancellationToken cancellationToken)
    {
        var command = new ApproveCreditNoteCommand { Id = id };
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
    /// Rejects a credit note
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<CreditNoteDto>> RejectCreditNote(
        Guid id,
        [FromBody] RejectCreditNoteCommand command,
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
    /// Issues a credit note
    /// </summary>
    [HttpPost("{id:guid}/issue")]
    public async Task<ActionResult<CreditNoteDto>> IssueCreditNote(Guid id, CancellationToken cancellationToken)
    {
        var command = new IssueCreditNoteCommand { Id = id };
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
    /// Voids a credit note
    /// </summary>
    [HttpPost("{id:guid}/void")]
    public async Task<ActionResult<CreditNoteDto>> VoidCreditNote(
        Guid id,
        [FromBody] VoidCreditNoteCommand command,
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
    /// Deletes a credit note
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteCreditNote(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteCreditNoteCommand { Id = id };
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
