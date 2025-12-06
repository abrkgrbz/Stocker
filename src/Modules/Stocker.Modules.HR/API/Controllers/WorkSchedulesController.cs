using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.WorkSchedules.Commands;
using Stocker.Modules.HR.Application.Features.WorkSchedules.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/work-schedules")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class WorkSchedulesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public WorkSchedulesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all work schedules with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<WorkScheduleDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<WorkScheduleDto>>> GetWorkSchedules(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? shiftId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] bool? isWorkDay = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWorkSchedulesQuery
        {
            TenantId = tenantId.Value,
            EmployeeId = employeeId,
            ShiftId = shiftId,
            FromDate = fromDate,
            ToDate = toDate,
            IsWorkDay = isWorkDay
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get work schedules for a specific employee
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(List<WorkScheduleDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<WorkScheduleDto>>> GetEmployeeWorkSchedules(
        int employeeId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWorkSchedulesQuery
        {
            TenantId = tenantId.Value,
            EmployeeId = employeeId,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get work schedule by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WorkScheduleDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<WorkScheduleDto>> GetWorkSchedule(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWorkScheduleByIdQuery { TenantId = tenantId.Value, ScheduleId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new work schedule
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(WorkScheduleDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<WorkScheduleDto>> CreateWorkSchedule(CreateWorkScheduleDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateWorkScheduleCommand { TenantId = tenantId.Value, ScheduleData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetWorkSchedule), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing work schedule
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(WorkScheduleDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<WorkScheduleDto>> UpdateWorkSchedule(int id, UpdateWorkScheduleDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateWorkScheduleCommand { TenantId = tenantId.Value, ScheduleId = id, ScheduleData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a work schedule
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteWorkSchedule(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteWorkScheduleCommand { TenantId = tenantId.Value, ScheduleId = id };
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
