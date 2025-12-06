using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.WorkLocations.Commands;
using Stocker.Modules.HR.Application.Features.WorkLocations.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
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
    private readonly ITenantService _tenantService;

    public WorkLocationsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWorkLocationsQuery
        {
            TenantId = tenantId.Value,
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWorkLocationByIdQuery { TenantId = tenantId.Value, WorkLocationId = id };
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateWorkLocationCommand { TenantId = tenantId.Value, LocationData = dto };
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateWorkLocationCommand { TenantId = tenantId.Value, WorkLocationId = id, LocationData = dto };
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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteWorkLocationCommand { TenantId = tenantId.Value, WorkLocationId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
