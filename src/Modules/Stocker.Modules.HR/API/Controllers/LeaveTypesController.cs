using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.LeaveTypes.Commands;
using Stocker.Modules.HR.Application.Features.LeaveTypes.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/leave-types")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class LeaveTypesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public LeaveTypesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all leave types with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<LeaveTypeDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<LeaveTypeDto>>> GetLeaveTypes(
        [FromQuery] bool? isPaid = null,
        [FromQuery] bool? requiresApproval = null,
        [FromQuery] bool includeInactive = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetLeaveTypesQuery
        {
            TenantId = tenantId.Value,
            IsPaid = isPaid,
            RequiresApproval = requiresApproval,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get leave type by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LeaveTypeDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<LeaveTypeDto>> GetLeaveType(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetLeaveTypeByIdQuery { TenantId = tenantId.Value, LeaveTypeId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new leave type
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LeaveTypeDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<LeaveTypeDto>> CreateLeaveType(CreateLeaveTypeDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateLeaveTypeCommand { TenantId = tenantId.Value, LeaveTypeData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetLeaveType), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing leave type
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LeaveTypeDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<LeaveTypeDto>> UpdateLeaveType(int id, UpdateLeaveTypeDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateLeaveTypeCommand { TenantId = tenantId.Value, LeaveTypeId = id, LeaveTypeData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a leave type
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteLeaveType(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteLeaveTypeCommand { TenantId = tenantId.Value, LeaveTypeId = id };
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
