using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.EmployeeBenefits.Commands;
using Stocker.Modules.HR.Application.Features.EmployeeBenefits.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employee-benefits")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeBenefitsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeeBenefitsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all employee benefits
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeBenefitDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<EmployeeBenefitDto>>> GetEmployeeBenefits()
    {
        var result = await _mediator.Send(new GetEmployeeBenefitsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get employee benefit by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeBenefitDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeBenefitDto>> GetEmployeeBenefit(int id)
    {
        var result = await _mediator.Send(new GetEmployeeBenefitByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Create a new employee benefit
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> CreateEmployeeBenefit(CreateEmployeeBenefitCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployeeBenefit), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing employee benefit
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(int), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> UpdateEmployeeBenefit(int id, UpdateEmployeeBenefitCommand command)
    {
        var commandWithId = command with { EmployeeBenefitId = id };
        var result = await _mediator.Send(commandWithId);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete an employee benefit
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteEmployeeBenefit(int id)
    {
        var command = new DeleteEmployeeBenefitCommand { EmployeeBenefitId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
