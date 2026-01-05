using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Shifts.Commands;
using Stocker.Modules.HR.Application.Features.Shifts.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/shifts")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class ShiftsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShiftsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all shifts
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ShiftDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ShiftDto>>> GetShifts(
        [FromQuery] bool activeOnly = true,
        [FromQuery] bool? nightShiftsOnly = null,
        [FromQuery] bool? flexibleOnly = null)
    {
        var query = new GetShiftsQuery
        {
            ActiveOnly = activeOnly,
            NightShiftsOnly = nightShiftsOnly,
            FlexibleOnly = flexibleOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get shift by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ShiftDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ShiftDto>> GetShift(int id)
    {
        var result = await _mediator.Send(new GetShiftByIdQuery(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new shift
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ShiftDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ShiftDto>> CreateShift(CreateShiftDto dto)
    {
        var command = new CreateShiftCommand
        {
            ShiftData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetShift), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing shift
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ShiftDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ShiftDto>> UpdateShift(int id, UpdateShiftDto dto)
    {
        var command = new UpdateShiftCommand
        {
            ShiftId = id,
            ShiftData = dto
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
    /// Delete a shift
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteShift(int id)
    {
        var result = await _mediator.Send(new DeleteShiftCommand(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
