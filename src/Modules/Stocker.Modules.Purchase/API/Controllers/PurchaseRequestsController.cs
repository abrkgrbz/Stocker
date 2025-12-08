using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Queries;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class PurchaseRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PurchaseRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPurchaseRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PurchaseRequestStatus? status = null,
        [FromQuery] PurchaseRequestPriority? priority = null,
        [FromQuery] Guid? requestedById = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetPurchaseRequestsQuery(
            page, pageSize, searchTerm, status, priority, requestedById, departmentId,
            fromDate, toDate, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPurchaseRequest(Guid id)
    {
        var result = await _mediator.Send(new GetPurchaseRequestByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var result = await _mediator.Send(new GetPendingPurchaseRequestsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("department/{departmentId:guid}")]
    public async Task<IActionResult> GetRequestsByDepartment(
        Guid departmentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetPurchaseRequestsByDepartmentQuery(departmentId, page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetMyPurchaseRequestsQuery(page, pageSize));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetRequestSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetPurchaseRequestSummaryQuery(fromDate, toDate));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePurchaseRequest([FromBody] CreatePurchaseRequestDto dto)
    {
        var result = await _mediator.Send(new CreatePurchaseRequestCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPurchaseRequest), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePurchaseRequest(Guid id, [FromBody] UpdatePurchaseRequestDto dto)
    {
        var result = await _mediator.Send(new UpdatePurchaseRequestCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreatePurchaseRequestItemDto item)
    {
        var result = await _mediator.Send(new AddPurchaseRequestItemCommand(id, item));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemovePurchaseRequestItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var result = await _mediator.Send(new SubmitPurchaseRequestCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApprovePurchaseRequestDto dto)
    {
        var result = await _mediator.Send(new ApprovePurchaseRequestCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectPurchaseRequestDto dto)
    {
        var result = await _mediator.Send(new RejectPurchaseRequestCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/convert-to-order")]
    public async Task<IActionResult> ConvertToOrder(Guid id)
    {
        var result = await _mediator.Send(new ConvertToPurchaseOrderCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(new { PurchaseOrderId = result.Value });
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelRequestDto request)
    {
        var result = await _mediator.Send(new CancelPurchaseRequestCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeletePurchaseRequestCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record CancelRequestDto(string Reason);
