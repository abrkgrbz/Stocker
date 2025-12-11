using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.TimeSheets.Commands;
using Stocker.Modules.HR.Application.Features.TimeSheets.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/time-sheets")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class TimeSheetsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public TimeSheetsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TimeSheetDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetTimeSheetsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TimeSheetDto>> GetTimeSheet(int id)
    {
        var result = await _mediator.Send(new GetTimeSheetByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateTimeSheetCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant context is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetTimeSheet), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTimeSheetCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant context is required");

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, TimeSheetId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant context is required");

        var result = await _mediator.Send(new DeleteTimeSheetCommand { TenantId = tenantId.Value, TimeSheetId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
