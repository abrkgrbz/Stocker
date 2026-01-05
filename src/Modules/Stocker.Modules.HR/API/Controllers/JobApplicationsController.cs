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
}
