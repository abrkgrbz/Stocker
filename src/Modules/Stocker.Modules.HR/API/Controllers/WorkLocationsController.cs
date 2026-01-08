using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.WorkLocations.Commands;
using Stocker.Modules.HR.Application.Features.WorkLocations.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/work-locations")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class WorkLocationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkLocationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all work locations with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<WorkLocationDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<WorkLocationDto>>> GetWorkLocations(
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool? headquartersOnly = null,
        [FromQuery] bool? remoteOnly = null,
        [FromQuery] bool? withGeofencing = null)
    {
        var query = new GetWorkLocationsQuery
        {
            IncludeInactive = includeInactive,
            OnlyHeadquarters = headquartersOnly,
            OnlyRemote = remoteOnly,
            OnlyWithGeofencing = withGeofencing
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get work location by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WorkLocationDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<WorkLocationDto>> GetWorkLocation(int id)
    {
        var query = new GetWorkLocationByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new work location
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(WorkLocationDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<WorkLocationDto>> CreateWorkLocation(CreateWorkLocationDto dto)
    {
        var command = new CreateWorkLocationCommand { LocationData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetWorkLocation), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing work location
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(WorkLocationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<WorkLocationDto>> UpdateWorkLocation(int id, UpdateWorkLocationDto dto)
    {
        var command = new UpdateWorkLocationCommand { WorkLocationId = id, LocationData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a work location
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteWorkLocation(int id)
    {
        var command = new DeleteWorkLocationCommand { WorkLocationId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }

    /// <summary>
    /// Activate a work location
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ActivateWorkLocation(int id)
    {
        var result = await _mediator.Send(new ActivateWorkLocationCommand(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }

    /// <summary>
    /// Deactivate a work location
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeactivateWorkLocation(int id)
    {
        var result = await _mediator.Send(new DeactivateWorkLocationCommand(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }
}
