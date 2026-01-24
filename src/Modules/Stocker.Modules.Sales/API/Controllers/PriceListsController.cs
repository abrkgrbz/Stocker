using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.PriceLists.Commands;
using Stocker.Modules.Sales.Application.Features.PriceLists.Queries;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class PriceListsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PriceListsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPriceLists(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PriceListType? type = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        var query = new GetPriceListsQuery(page, pageSize, searchTerm, type, isActive, sortBy, sortDescending);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPriceList(Guid id)
    {
        var result = await _mediator.Send(new GetPriceListByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetPriceListByCode(string code)
    {
        var result = await _mediator.Send(new GetPriceListByCodeQuery(code));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActivePriceLists()
    {
        var result = await _mediator.Send(new GetActivePriceListsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<IActionResult> GetPriceListsByCustomer(Guid customerId)
    {
        var result = await _mediator.Send(new GetPriceListsByCustomerQuery(customerId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePriceList([FromBody] CreatePriceListDto dto)
    {
        var result = await _mediator.Send(new CreatePriceListCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetPriceList), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePriceList(Guid id, [FromBody] UpdatePriceListDto dto)
    {
        var result = await _mediator.Send(new UpdatePriceListCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/activate")]
    public async Task<IActionResult> ActivatePriceList(Guid id)
    {
        var result = await _mediator.Send(new ActivatePriceListCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/deactivate")]
    public async Task<IActionResult> DeactivatePriceList(Guid id)
    {
        var result = await _mediator.Send(new DeactivatePriceListCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePriceList(Guid id)
    {
        var result = await _mediator.Send(new DeletePriceListCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    // Item management endpoints

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] AddPriceListItemDto dto)
    {
        var result = await _mediator.Send(new AddPriceListItemCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/items/{productId:guid}/price")]
    public async Task<IActionResult> UpdateItemPrice(Guid id, Guid productId, [FromBody] UpdatePriceListItemDto dto)
    {
        var result = await _mediator.Send(new UpdatePriceListItemPriceCommand(id, productId, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId)
    {
        var result = await _mediator.Send(new RemovePriceListItemCommand(id, itemId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    // Customer assignment endpoints

    [HttpPost("{id:guid}/customers")]
    public async Task<IActionResult> AssignCustomer(Guid id, [FromBody] AssignCustomerDto dto)
    {
        var result = await _mediator.Send(new AssignCustomerCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/customers/{customerId:guid}")]
    public async Task<IActionResult> RemoveCustomerAssignment(Guid id, Guid customerId)
    {
        var result = await _mediator.Send(new RemoveCustomerAssignmentCommand(id, customerId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }

    // Bulk operations

    [HttpPost("{id:guid}/bulk-adjustment")]
    public async Task<IActionResult> ApplyBulkAdjustment(Guid id, [FromBody] BulkAdjustmentDto dto)
    {
        var result = await _mediator.Send(new ApplyBulkAdjustmentCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    // Price lookup

    [HttpGet("{id:guid}/products/{productId:guid}/price")]
    public async Task<IActionResult> GetProductPrice(Guid id, Guid productId, [FromQuery] decimal quantity = 1)
    {
        var result = await _mediator.Send(new GetProductPriceQuery(id, productId, quantity));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }
}
