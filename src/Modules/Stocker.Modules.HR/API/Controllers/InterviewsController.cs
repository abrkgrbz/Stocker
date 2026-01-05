using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Interviews.Commands;
using Stocker.Modules.HR.Application.Features.Interviews.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/interviews")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class InterviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InterviewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetInterviewsQuery());
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewDto>> GetInterview(int id)
    {
        var result = await _mediator.Send(new GetInterviewByIdQuery(id));
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateInterviewCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetInterview), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateInterviewCommand command)
    {
        var result = await _mediator.Send(command with { InterviewId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteInterviewCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
