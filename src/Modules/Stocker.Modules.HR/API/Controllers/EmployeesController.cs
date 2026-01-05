using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Employees.Commands;
using Stocker.Modules.HR.Application.Features.Employees.Queries;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employees")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeesController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all employees with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeSummaryDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<EmployeeSummaryDto>>> GetEmployees(
        [FromQuery] int? departmentId = null,
        [FromQuery] int? positionId = null,
        [FromQuery] int? managerId = null,
        [FromQuery] EmployeeStatus? status = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] string? searchTerm = null)
    {
        var query = new GetEmployeesQuery
        {
            DepartmentId = departmentId,
            PositionId = positionId,
            ManagerId = managerId,
            Status = status,
            IncludeInactive = includeInactive,
            SearchTerm = searchTerm
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get employee by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
    {
        var result = await _mediator.Send(new GetEmployeeByIdQuery(id));

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new employee
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee(CreateEmployeeDto dto)
    {
        var command = new CreateEmployeeCommand
        {
            EmployeeData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployee), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing employee
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(EmployeeDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(int id, UpdateEmployeeDto dto)
    {
        var command = new UpdateEmployeeCommand
        {
            EmployeeId = id,
            EmployeeData = dto
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
    /// Terminate an employee
    /// </summary>
    [HttpPost("{id}/terminate")]
    [ProducesResponseType(typeof(EmployeeDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeDto>> TerminateEmployee(int id, TerminateEmployeeDto dto)
    {
        var command = new TerminateEmployeeCommand
        {
            EmployeeId = id,
            TerminationData = dto
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
}
