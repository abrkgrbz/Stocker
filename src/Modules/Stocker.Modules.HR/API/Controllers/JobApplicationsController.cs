using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.JobApplications.Commands;
using Stocker.Modules.HR.Application.Features.JobApplications.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/job-applications")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class JobApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public JobApplicationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobApplicationDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetJobApplicationsQuery());
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> GetJobApplication(int id)
    {
        var result = await _mediator.Send(new GetJobApplicationByIdQuery(id));
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateJobApplicationCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetJobApplication), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateJobApplicationCommand command)
    {
        var result = await _mediator.Send(command with { JobApplicationId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteJobApplicationCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Move a job application to the next stage
    /// </summary>
    [HttpPost("{id}/move-to-stage")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> MoveToNextStage(int id, [FromBody] MoveToStageRequest request)
    {
        var result = await _mediator.Send(new MoveToNextStageCommand(id, request.Stage));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Reject a job application
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectJobApplicationRequest request)
    {
        var result = await _mediator.Send(new RejectJobApplicationCommand(id, request.Reason, request.Category));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Hire a job applicant
    /// </summary>
    [HttpPost("{id}/hire")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Hire(int id, [FromBody] HireJobApplicationRequest request)
    {
        var result = await _mediator.Send(new HireJobApplicationCommand(id, request.HireDate));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}

public record MoveToStageRequest(string Stage);
public record RejectJobApplicationRequest(string Reason, string Category);
public record HireJobApplicationRequest(DateTime HireDate);
