using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Onboardings.Commands;
using Stocker.Modules.HR.Application.Features.Onboardings.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/onboardings")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class OnboardingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public OnboardingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<OnboardingDto>>> GetAll([FromQuery] int? employeeId = null, [FromQuery] bool activeOnly = false)
    {
        var result = await _mediator.Send(new GetOnboardingsQuery(employeeId, activeOnly));
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OnboardingDto>> GetOnboarding(int id)
    {
        var result = await _mediator.Send(new GetOnboardingByIdQuery(id));
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateOnboardingCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetOnboarding), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOnboardingCommand command)
    {
        var result = await _mediator.Send(command with { OnboardingId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteOnboardingCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Start an onboarding process
    /// </summary>
    [HttpPost("{id}/start")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Start(int id)
    {
        var result = await _mediator.Send(new StartOnboardingCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Complete an onboarding task
    /// </summary>
    [HttpPost("{id}/tasks/{taskId}/complete")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CompleteTask(int id, int taskId)
    {
        var result = await _mediator.Send(new CompleteOnboardingTaskCommand(id, taskId));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Complete an onboarding process
    /// </summary>
    [HttpPost("{id}/complete")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Complete(int id)
    {
        var result = await _mediator.Send(new CompleteOnboardingCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
