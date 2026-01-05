using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;
using Stocker.Modules.HR.Application.Features.EmployeeSkills.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employee-skills")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeSkillsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeeSkillsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeSkillDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<EmployeeSkillDto>>> GetEmployeeSkills()
    {
        var result = await _mediator.Send(new GetEmployeeSkillsQuery());
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeSkillDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeSkillDto>> GetEmployeeSkill(int id)
    {
        var result = await _mediator.Send(new GetEmployeeSkillByIdQuery(id));
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> CreateEmployeeSkill(CreateEmployeeSkillCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployeeSkill), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(bool), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<bool>> UpdateEmployeeSkill(int id, UpdateEmployeeSkillCommand command)
    {
        var commandWithId = command with { EmployeeSkillId = id };
        var result = await _mediator.Send(commandWithId);

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
        var command = new DeleteEmployeeSkillCommand { EmployeeSkillId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
