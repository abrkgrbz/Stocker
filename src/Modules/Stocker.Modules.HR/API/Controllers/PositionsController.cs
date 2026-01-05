using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Positions.Commands;
using Stocker.Modules.HR.Application.Features.Positions.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/positions")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class PositionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PositionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all positions with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PositionSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<PositionSummaryDto>>> GetPositions(
        [FromQuery] int? departmentId = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = new GetPositionsQuery
        {
            DepartmentId = departmentId,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get position by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PositionDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PositionDto>> GetPosition(int id)
    {
        var result = await _mediator.Send(new GetPositionByIdQuery(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new position
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PositionDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PositionDto>> CreatePosition(CreatePositionDto dto)
    {
        var command = new CreatePositionCommand
        {
            PositionData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPosition), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing position
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(PositionDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PositionDto>> UpdatePosition(int id, UpdatePositionDto dto)
    {
        var command = new UpdatePositionCommand
        {
            PositionId = id,
            PositionData = dto
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
    /// Delete a position
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeletePosition(int id)
    {
        var result = await _mediator.Send(new DeletePositionCommand(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
