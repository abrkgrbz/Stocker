using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Discounts.Commands;
using Stocker.Modules.Sales.Application.Features.Discounts.Queries;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.API.Controllers;

[ApiController]
[Route("api/sales/[controller]")]
[Authorize]
public class DiscountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DiscountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetDiscounts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] DiscountType? type = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = new GetDiscountsQuery(page, pageSize, searchTerm, type, isActive, sortBy, sortDescending);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDiscount(Guid id)
    {
        var result = await _mediator.Send(new GetDiscountByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetDiscountByCode(string code)
    {
        var result = await _mediator.Send(new GetDiscountByCodeQuery(code));

        if (!result.IsSuccess)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveDiscounts()
    {
        var result = await _mediator.Send(new GetActiveDiscountsQuery());

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateDiscountCode([FromBody] ApplyDiscountDto dto)
    {
        var result = await _mediator.Send(new ValidateDiscountCodeCommand(dto.Code, dto.OrderAmount, dto.Quantity));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDiscount([FromBody] CreateDiscountDto dto)
    {
        var result = await _mediator.Send(new CreateDiscountCommand(dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetDiscount), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDiscount(Guid id, [FromBody] UpdateDiscountDto dto)
    {
        var result = await _mediator.Send(new UpdateDiscountCommand(id, dto));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var result = await _mediator.Send(new ActivateDiscountCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var result = await _mediator.Send(new DeactivateDiscountCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteDiscountCommand(id));

        if (!result.IsSuccess)
            return BadRequest(result.Error);

        return NoContent();
    }
}
