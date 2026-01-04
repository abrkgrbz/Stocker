using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Checks.Commands;
using Stocker.Modules.Finance.Application.Features.Checks.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

/// <summary>
/// Çek (Check) API Controller
/// </summary>
[ApiController]
[Authorize]
[Route("api/finance/checks")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
public class ChecksController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChecksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated checks
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CheckSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PagedResult<CheckSummaryDto>>> GetChecks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? checkType = null,
        [FromQuery] int? status = null,
        [FromQuery] DateTime? dueDateFrom = null,
        [FromQuery] DateTime? dueDateTo = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetChecksQuery
        {
            TenantId = tenantId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Filter = new CheckFilterDto
            {
                SearchTerm = searchTerm,
                CheckType = checkType.HasValue ? (CheckType)checkType.Value : null,
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
    /// Get check by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CheckDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CheckDto>> GetCheck(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCheckByIdQuery
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
    /// Get check by number
    /// </summary>
    [HttpGet("by-number/{checkNumber}")]
    [ProducesResponseType(typeof(CheckDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CheckDto>> GetCheckByNumber(string checkNumber)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCheckByNumberQuery
        {
            TenantId = tenantId.Value,
            CheckNumber = checkNumber
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
    /// Get checks due in date range
    /// </summary>
    [HttpGet("due")]
    [ProducesResponseType(typeof(List<CheckSummaryDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CheckSummaryDto>>> GetChecksDue(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetChecksDueQuery
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
    /// Get check portfolio summary
    /// </summary>
    [HttpGet("portfolio-summary")]
    [ProducesResponseType(typeof(CheckPortfolioSummaryDto), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CheckPortfolioSummaryDto>> GetPortfolioSummary()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var query = new GetCheckPortfolioSummaryQuery
        {
            TenantId = tenantId.Value
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new check
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CheckDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CheckDto>> CreateCheck([FromBody] CreateCheckDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CreateCheckCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetCheck), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a check
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CheckDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CheckDto>> UpdateCheck(int id, [FromBody] UpdateCheckDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new UpdateCheckCommand
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
    /// Collect a check
    /// </summary>
    [HttpPost("{id}/collect")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CollectCheck(int id, [FromBody] CollectCheckDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CollectCheckCommand
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
    /// Bounce a check
    /// </summary>
    [HttpPost("{id}/bounce")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> BounceCheck(int id, [FromBody] BounceCheckDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new BounceCheckCommand
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
    /// Endorse a check
    /// </summary>
    [HttpPost("{id}/endorse")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> EndorseCheck(int id, [FromBody] EndorseCheckDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new EndorseCheckCommand
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
    /// Give check to bank for collection
    /// </summary>
    [HttpPost("{id}/give-to-bank")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GiveToBank(int id, [FromBody] CheckGiveToBankDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new GiveCheckToBankCommand
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
    /// Cancel a check
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CancelCheck(int id, [FromBody] CancelCheckDto dto)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new CancelCheckCommand
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
    /// Delete a check
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteCheck(int id)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?;
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        var command = new DeleteCheckCommand
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
