using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.JobPostings.Commands;
using Stocker.Modules.HR.Application.Features.JobPostings.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/job-postings")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class JobPostingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public JobPostingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<JobPostingDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<JobPostingDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetJobPostingsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(JobPostingDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<JobPostingDto>> GetJobPosting(int id)
    {
        var result = await _mediator.Send(new GetJobPostingByIdQuery(id));
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> Create(CreateJobPostingCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetJobPosting), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult> Update(int id, UpdateJobPostingCommand command)
    {
        var result = await _mediator.Send(command with { JobPostingId = id });
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
        var result = await _mediator.Send(new DeleteJobPostingCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
