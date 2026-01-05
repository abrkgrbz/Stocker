using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Departments.Commands;
using Stocker.Modules.HR.Application.Features.Departments.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/departments")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class DepartmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DepartmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all departments
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<DepartmentDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<DepartmentDto>>> GetDepartments(
        [FromQuery] bool includeInactive = false,
        [FromQuery] int? parentDepartmentId = null)
    {
        var query = new GetDepartmentsQuery
        {
            IncludeInactive = includeInactive,
            ParentDepartmentId = parentDepartmentId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get department tree with hierarchy
    /// </summary>
    [HttpGet("tree")]
    [ProducesResponseType(typeof(List<DepartmentTreeDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<DepartmentTreeDto>>> GetDepartmentTree()
    {
        var result = await _mediator.Send(new GetDepartmentTreeQuery());

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get department by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DepartmentDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DepartmentDto>> GetDepartment(int id)
    {
        var result = await _mediator.Send(new GetDepartmentByIdQuery(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new department
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DepartmentDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment(CreateDepartmentDto dto)
    {
        var command = new CreateDepartmentCommand
        {
            DepartmentData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetDepartment), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing department
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DepartmentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<DepartmentDto>> UpdateDepartment(int id, UpdateDepartmentDto dto)
    {
        var command = new UpdateDepartmentCommand
        {
            DepartmentId = id,
            DepartmentData = dto
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
    /// Delete a department
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var result = await _mediator.Send(new DeleteDepartmentCommand(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }
}
