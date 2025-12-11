using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Grievances.Commands;
using Stocker.Modules.HR.Application.Features.Grievances.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/grievances")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class GrievancesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public GrievancesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<GrievanceDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetGrievancesQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GrievanceDto>> GetGrievance(int id)
    {
        var result = await _mediator.Send(new GetGrievanceByIdQuery { Id = id });
        if (result.IsFailure) return NotFound(result.Error);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateGrievanceCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized("Tenant ID not found");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetGrievance), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdateGrievanceCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized("Tenant ID not found");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, GrievanceId = id });
        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return Unauthorized("Tenant ID not found");

        var result = await _mediator.Send(new DeleteGrievanceCommand(tenantId.Value, id));
        if (result.IsFailure) return BadRequest(result.Error);

        return NoContent();
    }
}
