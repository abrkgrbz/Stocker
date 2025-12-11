using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.CareerPaths.Commands;
using Stocker.Modules.HR.Application.Features.CareerPaths.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/career-paths")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class CareerPathsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public CareerPathsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all career paths
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CareerPathDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<CareerPathDto>>> GetCareerPaths()
    {
        var result = await _mediator.Send(new GetCareerPathsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get career path by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CareerPathDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<CareerPathDto>> GetCareerPath(int id)
    {
        var result = await _mediator.Send(new GetCareerPathByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Create a new career path
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> CreateCareerPath(CreateCareerPathCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetCareerPath), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing career path
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Guid), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> UpdateCareerPath(int id, UpdateCareerPathCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value, CareerPathId = id };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a career path
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteCareerPath(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var command = new DeleteCareerPathCommand { TenantId = tenantId.Value, CareerPathId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
