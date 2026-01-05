using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Holidays.Commands;
using Stocker.Modules.HR.Application.Features.Holidays.Queries;
using Stocker.SharedKernel.Authorization;
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

    public HolidaysController(IMediator mediator)
    {
        _mediator = mediator;
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
        var query = new GetHolidaysQuery
        {
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
        var query = new GetHolidayByIdQuery(id);
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
        var command = new CreateHolidayCommand { HolidayData = dto };
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
        var command = new UpdateHolidayCommand { HolidayId = id, HolidayData = dto };
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
        var command = new DeleteHolidayCommand { HolidayId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }
}
