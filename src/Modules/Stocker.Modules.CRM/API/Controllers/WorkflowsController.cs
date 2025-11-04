using Stocker.SharedKernel.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Workflows.Commands.CreateWorkflow;
using Stocker.Modules.CRM.Application.Features.Workflows.Commands.ActivateWorkflow;
using Stocker.Modules.CRM.Application.Features.Workflows.Commands.DeactivateWorkflow;
using Stocker.Modules.CRM.Application.Features.Workflows.Commands.ExecuteWorkflow;
using Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetWorkflow;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/workflows")]
[RequireModule("CRM")]
public class WorkflowsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WorkflowsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new workflow
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWorkflow([FromBody] CreateWorkflowCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetWorkflowById), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Get workflow by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WorkflowResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkflowById(int id)
    {
        var result = await _mediator.Send(new GetWorkflowByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Activate a workflow
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActivateWorkflow(int id)
    {
        var result = await _mediator.Send(new ActivateWorkflowCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { message = "Workflow activated successfully" });
    }

    /// <summary>
    /// Deactivate a workflow
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateWorkflow(int id)
    {
        var command = new DeactivateWorkflowCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { message = "Workflow deactivated successfully" });
    }

    /// <summary>
    /// Execute a workflow manually
    /// </summary>
    [HttpPost("execute")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ExecuteWorkflow([FromBody] ExecuteWorkflowCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { executionId = result.Value, message = "Workflow execution started" });
    }
}
