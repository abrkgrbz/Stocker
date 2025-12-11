using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Interviews.Commands;
using Stocker.Modules.HR.Application.Features.Interviews.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/interviews")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class InterviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public InterviewsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetInterviewsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewDto>> GetInterview(int id)
    {
        var result = await _mediator.Send(new GetInterviewByIdQuery { Id = id });
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateInterviewCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized("Tenant context is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetInterview), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateInterviewCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized("Tenant context is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, InterviewId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized("Tenant context is required");

        var result = await _mediator.Send(new DeleteInterviewCommand(tenantId.Value, id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
