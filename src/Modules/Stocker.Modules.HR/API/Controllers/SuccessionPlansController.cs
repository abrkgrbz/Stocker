using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.SuccessionPlans.Commands;
using Stocker.Modules.HR.Application.Features.SuccessionPlans.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/succession-plans")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class SuccessionPlansController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public SuccessionPlansController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SuccessionPlanDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetSuccessionPlansQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SuccessionPlanDto>> GetSuccessionPlan(int id)
    {
        var result = await _mediator.Send(new GetSuccessionPlanByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateSuccessionPlanCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetSuccessionPlan), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateSuccessionPlanCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, SuccessionPlanId = id });
        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized();

        var result = await _mediator.Send(new DeleteSuccessionPlanCommand { TenantId = tenantId.Value, SuccessionPlanId = id });
        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent();
    }
}
