using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.Suppliers.Commands;
using Stocker.Modules.Purchase.Application.Features.Suppliers.Queries;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SuppliersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSuppliers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] SupplierType? type = null,
        [FromQuery] SupplierStatus? status = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? city = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetSuppliersQuery(
            page, pageSize, searchTerm, type, status, isActive, city, sortBy, sortDescending);

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSupplier(Guid id)
    {
        var result = await _mediator.Send(new GetSupplierByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetSupplierByCode(string code)
    {
        var result = await _mediator.Send(new GetSupplierByCodeQuery(code));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSuppliers()
    {
        var result = await _mediator.Send(new GetActiveSuppliersQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetSuppliersByProduct(Guid productId)
    {
        var result = await _mediator.Send(new GetSuppliersByProductQuery(productId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}/products")]
    public async Task<IActionResult> GetSupplierProducts(Guid id)
    {
        var result = await _mediator.Send(new GetSupplierProductsQuery(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}/contacts")]
    public async Task<IActionResult> GetSupplierContacts(Guid id)
    {
        var result = await _mediator.Send(new GetSupplierContactsQuery(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSupplierSummary()
    {
        var result = await _mediator.Send(new GetSupplierSummaryQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupplier([FromBody] CreateSupplierDto dto)
    {
        var result = await _mediator.Send(new CreateSupplierCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetSupplier), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSupplier(Guid id, [FromBody] UpdateSupplierDto dto)
    {
        var result = await _mediator.Send(new UpdateSupplierCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var result = await _mediator.Send(new ActivateSupplierCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var result = await _mediator.Send(new DeactivateSupplierCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/blacklist")]
    public async Task<IActionResult> Blacklist(Guid id, [FromBody] BlacklistRequest request)
    {
        var result = await _mediator.Send(new BlacklistSupplierCommand(id, request.Reason));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/contacts")]
    public async Task<IActionResult> AddContact(Guid id, [FromBody] CreateSupplierContactDto contact)
    {
        var result = await _mediator.Send(new AddSupplierContactCommand(id, contact));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/contacts/{contactId:guid}")]
    public async Task<IActionResult> RemoveContact(Guid id, Guid contactId)
    {
        var result = await _mediator.Send(new RemoveSupplierContactCommand(id, contactId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/products")]
    public async Task<IActionResult> AddProduct(Guid id, [FromBody] CreateSupplierProductDto product)
    {
        var result = await _mediator.Send(new AddSupplierProductCommand(id, product));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/products/{productId:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, Guid productId, [FromBody] UpdateSupplierProductDto dto)
    {
        var result = await _mediator.Send(new UpdateSupplierProductCommand(id, productId, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}/products/{productId:guid}")]
    public async Task<IActionResult> RemoveProduct(Guid id, Guid productId)
    {
        var result = await _mediator.Send(new RemoveSupplierProductCommand(id, productId));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/rating")]
    public async Task<IActionResult> SetRating(Guid id, [FromBody] SetRatingRequest request)
    {
        var result = await _mediator.Send(new SetSupplierRatingCommand(id, request.Rating));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteSupplierCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}

public record BlacklistRequest(string Reason);
public record SetRatingRequest(int Rating);
