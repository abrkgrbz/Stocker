using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Overtimes.Commands;
using Stocker.Modules.HR.Application.Features.Overtimes.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/overtimes")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class OvertimesController : ControllerBase
{
    private readonly IMediator _mediator;

    public OvertimesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<OvertimeDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetOvertimesQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OvertimeDto>> GetOvertime(int id)
    {
        var result = await _mediator.Send(new GetOvertimeByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateOvertimeCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetOvertime), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateOvertimeCommand command)
    {
        var result = await _mediator.Send(command with { OvertimeId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteOvertimeCommand { OvertimeId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Approve an overtime request
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveOvertimeRequest request)
    {
        var result = await _mediator.Send(new ApproveOvertimeCommand(id, request.ApprovedById, request.Notes));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Reject an overtime request
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectOvertimeRequest request)
    {
        var result = await _mediator.Send(new RejectOvertimeCommand(id, request.RejectedById, request.Reason));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}

public record ApproveOvertimeRequest(int ApprovedById, string? Notes);
public record RejectOvertimeRequest(int RejectedById, string Reason);
