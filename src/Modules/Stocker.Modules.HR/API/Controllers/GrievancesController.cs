using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Grievances.Commands;
using Stocker.Modules.HR.Application.Features.Grievances.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/grievances")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class GrievancesController : ControllerBase
{
    private readonly IMediator _mediator;

    public GrievancesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<GrievanceDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<GrievanceDto>>> GetAll([FromQuery] int? complainantId = null, [FromQuery] bool openOnly = false)
    {
        var result = await _mediator.Send(new GetGrievancesQuery { ComplainantId = complainantId, OpenOnly = openOnly });
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GrievanceDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<GrievanceDto>> GetGrievance(int id)
    {
        var result = await _mediator.Send(new GetGrievanceByIdQuery(id));
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> Create(CreateGrievanceCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetGrievance), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> Update(int id, UpdateGrievanceCommand command)
    {
        var result = await _mediator.Send(command with { GrievanceId = id });
        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteGrievanceCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent();
    }

    /// <summary>
    /// Resolve a grievance
    /// </summary>
    [HttpPost("{id}/resolve")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Resolve(int id, [FromBody] ResolveGrievanceRequest request)
    {
        var result = await _mediator.Send(new ResolveGrievanceCommand(id, request.Resolution, request.ResolutionType, request.ActionsTaken));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Escalate a grievance
    /// </summary>
    [HttpPost("{id}/escalate")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Escalate(int id, [FromBody] EscalateGrievanceRequest request)
    {
        var result = await _mediator.Send(new EscalateGrievanceCommand(id, request.Reason));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}

public record ResolveGrievanceRequest(string Resolution, string ResolutionType, string? ActionsTaken);
public record EscalateGrievanceRequest(string Reason);
