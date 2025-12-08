using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Quotations.Commands;
using Stocker.Modules.Sales.Application.Features.Quotations.Queries;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class QuotationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public QuotationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuotations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] QuotationStatus? status = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? salesPersonId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetQuotationsQuery(
            page, pageSize, searchTerm, status, customerId, salesPersonId,
            fromDate, toDate, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetQuotation(Guid id)
    {
        var result = await _mediator.Send(new GetQuotationByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<IActionResult> GetQuotationsByCustomer(
        Guid customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetQuotationsByCustomerQuery(customerId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("salesperson/{salesPersonId:guid}")]
    public async Task<IActionResult> GetQuotationsBySalesPerson(
        Guid salesPersonId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetQuotationsBySalesPersonQuery(salesPersonId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("expiring")]
    public async Task<IActionResult> GetExpiringQuotations([FromQuery] int daysUntilExpiry = 7)
    {
        var result = await _mediator.Send(new GetExpiringQuotationsQuery(daysUntilExpiry));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}/revisions")]
    public async Task<IActionResult> GetQuotationRevisions(Guid id)
    {
        var result = await _mediator.Send(new GetQuotationRevisionsQuery(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetQuotationStatisticsQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuotation([FromBody] CreateQuotationDto dto)
    {
        var result = await _mediator.Send(new CreateQuotationCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetQuotation), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateQuotation(Guid id, [FromBody] UpdateQuotationDto dto)
    {
        var result = await _mediator.Send(new UpdateQuotationCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreateQuotationItemDto item)
    {
        var result = await _mediator.Send(new AddQuotationItemCommand(id, item));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemoveQuotationItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit-for-approval")]
    public async Task<IActionResult> SubmitForApproval(Guid id)
    {
        var result = await _mediator.Send(new SubmitQuotationForApprovalCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _mediator.Send(new ApproveQuotationCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send(Guid id)
    {
        var result = await _mediator.Send(new SendQuotationCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id)
    {
        var result = await _mediator.Send(new AcceptQuotationCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectQuotationRequest request)
    {
        var result = await _mediator.Send(new RejectQuotationCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelQuotationRequest request)
    {
        var result = await _mediator.Send(new CancelQuotationCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/convert-to-order")]
    public async Task<IActionResult> ConvertToOrder(Guid id)
    {
        var result = await _mediator.Send(new ConvertQuotationToOrderCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { OrderId = result.Value });
    }

    [HttpPost("{id:guid}/create-revision")]
    public async Task<IActionResult> CreateRevision(Guid id)
    {
        var result = await _mediator.Send(new CreateQuotationRevisionCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteQuotationCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record RejectQuotationRequest(string Reason);
public record CancelQuotationRequest(string Reason);
