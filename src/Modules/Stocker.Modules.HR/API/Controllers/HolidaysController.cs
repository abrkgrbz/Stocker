using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Holidays.Commands;
using Stocker.Modules.HR.Application.Features.Holidays.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/holidays")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class HolidaysController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public HolidaysController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all holidays with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<HolidayDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<HolidayDto>>> GetHolidays(
        [FromQuery] int? year = null,
        [FromQuery] bool? isRecurring = null,
        [FromQuery] bool includeInactive = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetHolidaysQuery
        {
            TenantId = tenantId.Value,
            Year = year,
            IsRecurring = isRecurring,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get holiday by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(HolidayDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<HolidayDto>> GetHoliday(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetHolidayByIdQuery { TenantId = tenantId.Value, HolidayId = id };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new holiday
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(HolidayDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<HolidayDto>> CreateHoliday(CreateHolidayDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateHolidayCommand { TenantId = tenantId.Value, HolidayData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetHoliday), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing holiday
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(HolidayDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<HolidayDto>> UpdateHoliday(int id, UpdateHolidayDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateHolidayCommand { TenantId = tenantId.Value, HolidayId = id, HolidayData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a holiday
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteHoliday(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteHolidayCommand { TenantId = tenantId.Value, HolidayId = id };
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
