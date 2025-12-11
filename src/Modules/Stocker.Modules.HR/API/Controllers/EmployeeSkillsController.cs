using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;
using Stocker.Modules.HR.Application.Features.EmployeeSkills.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employee-skills")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeSkillsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public EmployeeSkillsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeSkillDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<EmployeeSkillDto>>> GetEmployeeSkills()
    {
        var result = await _mediator.Send(new GetEmployeeSkillsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeSkillDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeSkillDto>> GetEmployeeSkill(int id)
    {
        var result = await _mediator.Send(new GetEmployeeSkillByIdQuery { Id = id });
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> CreateEmployeeSkill(CreateEmployeeSkillCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployeeSkill), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(int), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> UpdateEmployeeSkill(int id, UpdateEmployeeSkillCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value, EmployeeSkillId = id };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteEmployeeSkill(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var command = new DeleteEmployeeSkillCommand(tenantId.Value, id);
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
