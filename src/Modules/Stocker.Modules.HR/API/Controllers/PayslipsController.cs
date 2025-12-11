using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Payslips.Commands;
using Stocker.Modules.HR.Application.Features.Payslips.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/payslips")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class PayslipsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public PayslipsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PayslipDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetPayslipsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PayslipDto>> GetPayslip(int id)
    {
        var result = await _mediator.Send(new GetPayslipByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PayslipDto>> Create(CreatePayslipCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value });
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetPayslip), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdatePayslipCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null) return Unauthorized();

        var result = await _mediator.Send(command with { TenantId = tenantId.Value, PayslipId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == null) return Unauthorized();

        var result = await _mediator.Send(new DeletePayslipCommand { TenantId = tenantId.Value, PayslipId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}
