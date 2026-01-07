using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Payslips.Commands;
using Stocker.Modules.HR.Application.Features.Payslips.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/payslips")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class PayslipsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PayslipsController(IMediator mediator)
    {
        _mediator = mediator;
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
        var result = await _mediator.Send(command);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetPayslip), new { id = result.Value }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, UpdatePayslipCommand command)
    {
        var result = await _mediator.Send(command with { PayslipId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeletePayslipCommand { PayslipId = id });
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Send a payslip to employee
    /// </summary>
    [HttpPost("{id}/send")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Send(int id)
    {
        var result = await _mediator.Send(new SendPayslipCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Mark a payslip as paid
    /// </summary>
    [HttpPost("{id}/mark-as-paid")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> MarkAsPaid(int id, [FromBody] MarkAsPaidRequest request)
    {
        var result = await _mediator.Send(new MarkPayslipAsPaidCommand(id, request.Amount, request.PaymentReference));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Finalize a payslip (approve)
    /// </summary>
    [HttpPost("{id}/finalize")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Finalize(int id)
    {
        var result = await _mediator.Send(new FinalizePayslipCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    /// <summary>
    /// Cancel a payslip (reject)
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Cancel(int id)
    {
        var result = await _mediator.Send(new CancelPayslipCommand(id));
        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }
}

public record MarkAsPaidRequest(decimal Amount, string? PaymentReference);
