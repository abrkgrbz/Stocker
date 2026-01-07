using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.TimeSheets.Commands;
using Stocker.Modules.HR.Application.Features.TimeSheets.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/time-sheets")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class TimeSheetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TimeSheetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<TimeSheetDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetTimeSheetsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TimeSheetDto>> GetTimeSheet(int id)
    {
        var result = await _mediator.Send(new GetTimeSheetByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateTimeSheetCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetTimeSheet), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTimeSheetCommand command)
    {
        var result = await _mediator.Send(command with { TimeSheetId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteTimeSheetCommand { TimeSheetId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Submit a timesheet for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Submit(int id)
    {
        var result = await _mediator.Send(new SubmitTimeSheetCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Approve a timesheet
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveTimeSheetRequest request)
    {
        var result = await _mediator.Send(new ApproveTimeSheetCommand(id, request.ApprovedById, request.Notes));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Reject a timesheet
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectTimeSheetRequest request)
    {
        var result = await _mediator.Send(new RejectTimeSheetCommand(id, request.RejectedById, request.Reason));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}

public record ApproveTimeSheetRequest(int ApprovedById, string? Notes);
public record RejectTimeSheetRequest(int RejectedById, string Reason);
