using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.EmployeeBenefits.Commands;
using Stocker.Modules.HR.Application.Features.EmployeeBenefits.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employee-benefits")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeBenefitsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public EmployeeBenefitsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
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
    [ProducesResponseType(typeof(Guid), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> CreateEmployeeBenefit(CreateEmployeeBenefitCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployeeBenefit), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing employee benefit
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Guid), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> UpdateEmployeeBenefit(int id, UpdateEmployeeBenefitCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value, EmployeeBenefitId = id };
        var result = await _mediator.Send(commandWithTenant);

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
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var command = new DeleteEmployeeBenefitCommand { TenantId = tenantId.Value, EmployeeBenefitId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
