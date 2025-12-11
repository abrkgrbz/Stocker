using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Onboardings.Commands;
using Stocker.Modules.HR.Application.Features.Onboardings.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/onboardings")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class OnboardingsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public OnboardingsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<OnboardingDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetOnboardingsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OnboardingDto>> GetOnboarding(int id)
    {
        var result = await _mediator.Send(new GetOnboardingByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateOnboardingCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetOnboarding), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOnboardingCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, OnboardingId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null) return Unauthorized();

        var result = await _mediator.Send(new DeleteOnboardingCommand { TenantId = tenantId.Value, OnboardingId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
