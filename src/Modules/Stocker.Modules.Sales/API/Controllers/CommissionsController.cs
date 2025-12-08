using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Commissions.Commands;
using Stocker.Modules.Sales.Application.Features.Commissions.Queries;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class CommissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CommissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Commission Plans

    [HttpGet("plans")]
    public async Task<IActionResult> GetCommissionPlans(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] CommissionType? type = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetCommissionPlansQuery(page, pageSize, searchTerm, type, isActive, sortBy, sortDescending);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("plans/{id:guid}")]
    public async Task<IActionResult> GetCommissionPlan(Guid id)
    {
        var result = await _mediator.Send(new GetCommissionPlanByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("plans/active")]
    public async Task<IActionResult> GetActiveCommissionPlans()
    {
        var result = await _mediator.Send(new GetActiveCommissionPlansQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("plans")]
    public async Task<IActionResult> CreateCommissionPlan([FromBody] CreateCommissionPlanDto dto)
    {
        var result = await _mediator.Send(new CreateCommissionPlanCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetCommissionPlan), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("plans/{id:guid}")]
    public async Task<IActionResult> UpdateCommissionPlan(Guid id, [FromBody] UpdateCommissionPlanDto dto)
    {
        var result = await _mediator.Send(new UpdateCommissionPlanCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("plans/{id:guid}/tiers")]
    public async Task<IActionResult> AddTier(Guid id, [FromBody] CreateCommissionTierDto tier)
    {
        var result = await _mediator.Send(new AddCommissionTierCommand(id, tier));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("plans/{id:guid}/tiers/{tierId:guid}")]
    public async Task<IActionResult> RemoveTier(Guid id, Guid tierId)
    {
        var result = await _mediator.Send(new RemoveCommissionTierCommand(id, tierId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("plans/{id:guid}/activate")]
    public async Task<IActionResult> ActivatePlan(Guid id)
    {
        var result = await _mediator.Send(new ActivateCommissionPlanCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("plans/{id:guid}/deactivate")]
    public async Task<IActionResult> DeactivatePlan(Guid id)
    {
        var result = await _mediator.Send(new DeactivateCommissionPlanCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("plans/{id:guid}")]
    public async Task<IActionResult> DeletePlan(Guid id)
    {
        var result = await _mediator.Send(new DeleteCommissionPlanCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    #endregion

    #region Sales Commissions

    [HttpGet]
    public async Task<IActionResult> GetSalesCommissions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? salesPersonId = null,
        [FromQuery] SalesCommissionStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetSalesCommissionsQuery(page, pageSize, salesPersonId, status, fromDate, toDate, sortBy, sortDescending);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSalesCommission(Guid id)
    {
        var result = await _mediator.Send(new GetSalesCommissionByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("salesperson/{salesPersonId:guid}")]
    public async Task<IActionResult> GetCommissionsBySalesPerson(
        Guid salesPersonId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetCommissionsBySalesPersonQuery(salesPersonId, fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingCommissions()
    {
        var result = await _mediator.Send(new GetPendingCommissionsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("approved")]
    public async Task<IActionResult> GetApprovedCommissions()
    {
        var result = await _mediator.Send(new GetApprovedCommissionsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetCommissionSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetCommissionSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary/salesperson/{salesPersonId:guid}")]
    public async Task<IActionResult> GetSalesPersonCommissionSummary(
        Guid salesPersonId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetSalesPersonCommissionSummaryQuery(salesPersonId, fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> CalculateCommission([FromBody] CalculateCommissionDto dto)
    {
        var result = await _mediator.Send(new CalculateSalesCommissionCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> ApproveCommission(Guid id)
    {
        var result = await _mediator.Send(new ApproveSalesCommissionCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> RejectCommission(Guid id, [FromBody] RejectCommissionRequest request)
    {
        var result = await _mediator.Send(new RejectSalesCommissionCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkAsPaid(Guid id, [FromBody] MarkPaidRequest request)
    {
        var result = await _mediator.Send(new MarkCommissionAsPaidCommand(id, request.PaymentReference));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelCommission(Guid id, [FromBody] CancelCommissionRequest request)
    {
        var result = await _mediator.Send(new CancelSalesCommissionCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("bulk/approve")]
    public async Task<IActionResult> BulkApprove([FromBody] BulkApproveRequest request)
    {
        var result = await _mediator.Send(new BulkApproveCommissionsCommand(request.Ids));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { ApprovedCount = result.Value });
    }

    [HttpPost("bulk/mark-paid")]
    public async Task<IActionResult> BulkMarkPaid([FromBody] BulkMarkPaidRequest request)
    {
        var result = await _mediator.Send(new BulkMarkCommissionsAsPaidCommand(request.Ids, request.PaymentReference));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { PaidCount = result.Value });
    }

    #endregion
}

public record RejectCommissionRequest(string Reason);
public record MarkPaidRequest(string PaymentReference);
public record CancelCommissionRequest(string Reason);
public record BulkApproveRequest(List<Guid> Ids);
public record BulkMarkPaidRequest(List<Guid> Ids, string PaymentReference);
