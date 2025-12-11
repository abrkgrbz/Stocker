using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Overtimes.Commands;
using Stocker.Modules.HR.Application.Features.Overtimes.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/overtimes")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class OvertimesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public OvertimesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<OvertimeDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetOvertimesQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OvertimeDto>> GetOvertime(int id)
    {
        var result = await _mediator.Send(new GetOvertimeByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateOvertimeCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetOvertime), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateOvertimeCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, OvertimeId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var result = await _mediator.Send(new DeleteOvertimeCommand { TenantId = tenantId.Value, OvertimeId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
