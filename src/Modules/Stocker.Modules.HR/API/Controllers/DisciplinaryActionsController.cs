using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.DisciplinaryActions.Commands;
using Stocker.Modules.HR.Application.Features.DisciplinaryActions.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/disciplinary-actions")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class DisciplinaryActionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public DisciplinaryActionsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all disciplinary actions
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<DisciplinaryActionDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<DisciplinaryActionDto>>> GetDisciplinaryActions()
    {
        var result = await _mediator.Send(new GetDisciplinaryActionsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get disciplinary action by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DisciplinaryActionDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DisciplinaryActionDto>> GetDisciplinaryAction(int id)
    {
        var result = await _mediator.Send(new GetDisciplinaryActionByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Create a new disciplinary action
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> CreateDisciplinaryAction(CreateDisciplinaryActionCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetDisciplinaryAction), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing disciplinary action
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Guid), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> UpdateDisciplinaryAction(int id, UpdateDisciplinaryActionCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value, DisciplinaryActionId = id };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a disciplinary action
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteDisciplinaryAction(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var command = new DeleteDisciplinaryActionCommand { TenantId = tenantId.Value, DisciplinaryActionId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
