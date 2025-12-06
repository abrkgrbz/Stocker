using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Leaves.Commands;
using Stocker.Modules.HR.Application.Features.Leaves.Queries;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/leaves")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class LeavesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public LeavesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all leaves with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<LeaveDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<LeaveDto>>> GetLeaves(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? leaveTypeId = null,
        [FromQuery] LeaveStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? year = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetLeavesQuery
        {
            TenantId = tenantId.Value,
            EmployeeId = employeeId,
            LeaveTypeId = leaveTypeId,
            Status = status,
            StartDate = startDate,
            EndDate = endDate,
            Year = year
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get leave by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LeaveDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<LeaveDto>> GetLeave(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetLeaveByIdQuery { TenantId = tenantId.Value, LeaveId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Get employee's leave balance
    /// </summary>
    [HttpGet("balance/{employeeId}")]
    [ProducesResponseType(typeof(List<LeaveBalanceDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<LeaveBalanceDto>>> GetLeaveBalance(int employeeId, [FromQuery] int? year = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetLeaveBalanceQuery
        {
            TenantId = tenantId.Value,
            EmployeeId = employeeId,
            Year = year ?? DateTime.UtcNow.Year
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a leave request
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LeaveDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<LeaveDto>> CreateLeave(CreateLeaveDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateLeaveCommand { TenantId = tenantId.Value, LeaveData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetLeave), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a leave request
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LeaveDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<LeaveDto>> UpdateLeave(int id, UpdateLeaveDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateLeaveCommand { TenantId = tenantId.Value, LeaveId = id, LeaveData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Approve or reject a leave request
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(LeaveDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<LeaveDto>> ApproveLeave(int id, ApproveLeaveDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ApproveLeaveCommand
        {
            TenantId = tenantId.Value,
            LeaveId = id,
            IsApproved = dto.IsApproved,
            ApprovedById = dto.ApproverId,
            Notes = dto.ApprovalNotes
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Cancel a leave request
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(LeaveDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<LeaveDto>> CancelLeave(int id, [FromBody] CancelLeaveDto? dto = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CancelLeaveCommand
        {
            TenantId = tenantId.Value,
            LeaveId = id,
            Reason = dto?.CancellationReason
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}

public class ApproveLeaveDto
{
    public bool IsApproved { get; set; }
    public int ApproverId { get; set; }
    public string? ApprovalNotes { get; set; }
}

public class CancelLeaveDto
{
    public string? CancellationReason { get; set; }
}
