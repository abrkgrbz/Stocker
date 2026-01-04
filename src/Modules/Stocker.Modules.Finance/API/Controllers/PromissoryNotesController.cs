using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.PromissoryNotes.Commands;
using Stocker.Modules.Finance.Application.Features.PromissoryNotes.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Senet (Promissory Note) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/promissory-notes")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class PromissoryNotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PromissoryNotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated promissory notes
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PromissoryNoteSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<PromissoryNoteSummaryDto>>> GetPromissoryNotes(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? noteType = null,
        [FromQuery] int? status = null,
        [FromQuery] DateTime? dueDateFrom = null,
        [FromQuery] DateTime? dueDateTo = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetPromissoryNotesQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Filter = new PromissoryNoteFilterDto
            {
                SearchTerm = searchTerm,
                NoteType = noteType.HasValue ? (PromissoryNoteType)noteType.Value : null,
                Status = status.HasValue ? (NegotiableInstrumentStatus)status.Value : null,
                DueDateFrom = dueDateFrom,
                DueDateTo = dueDateTo
            },
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get promissory note by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PromissoryNoteDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PromissoryNoteDto>> GetPromissoryNote(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetPromissoryNoteByIdQuery
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get promissory note by number
    /// </summary>
    [HttpGet("by-number/{noteNumber}")]
    [ProducesResponseType(typeof(PromissoryNoteDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PromissoryNoteDto>> GetPromissoryNoteByNumber(string noteNumber)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetPromissoryNoteByNumberQuery
        {
            TenantId = tenantId.Value,
            NoteNumber = noteNumber
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get promissory notes due in date range
    /// </summary>
    [HttpGet("due")]
    [ProducesResponseType(typeof(List<PromissoryNoteSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<PromissoryNoteSummaryDto>>> GetPromissoryNotesDue(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetPromissoryNotesDueQuery
        {
            TenantId = tenantId.Value,
            StartDate = startDate,
            EndDate = endDate
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get promissory note portfolio summary
    /// </summary>
    [HttpGet("portfolio-summary")]
    [ProducesResponseType(typeof(PromissoryNotePortfolioSummaryDto), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PromissoryNotePortfolioSummaryDto>> GetPortfolioSummary()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetPromissoryNotePortfolioSummaryQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new promissory note
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PromissoryNoteDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PromissoryNoteDto>> CreatePromissoryNote([FromBody] CreatePromissoryNoteDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreatePromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPromissoryNote), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a promissory note
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(PromissoryNoteDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PromissoryNoteDto>> UpdatePromissoryNote(int id, [FromBody] UpdatePromissoryNoteDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdatePromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Collect a promissory note
    /// </summary>
    [HttpPost("{id}/collect")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CollectPromissoryNote(int id, [FromBody] CollectPromissoryNoteDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CollectPromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Protest a promissory note
    /// </summary>
    [HttpPost("{id}/protest")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ProtestPromissoryNote(int id, [FromBody] ProtestPromissoryNoteDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new ProtestPromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Endorse a promissory note
    /// </summary>
    [HttpPost("{id}/endorse")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> EndorsePromissoryNote(int id, [FromBody] EndorsePromissoryNoteDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new EndorsePromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Give promissory note to bank for collection
    /// </summary>
    [HttpPost("{id}/give-to-bank")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GiveToBank(int id, [FromBody] PromissoryNoteGiveToBankDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new GivePromissoryNoteToBankCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Cancel a promissory note
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CancelPromissoryNote(int id, [FromBody] CancelPromissoryNoteDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CancelPromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a promissory note
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeletePromissoryNote(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeletePromissoryNoteCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
