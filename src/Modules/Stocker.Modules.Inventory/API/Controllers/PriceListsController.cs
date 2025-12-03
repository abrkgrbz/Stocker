using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;
using Stocker.Modules.Inventory.Application.Features.PriceLists.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/price-lists")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class PriceListsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PriceListsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all price lists
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PriceListListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<PriceListListDto>>> GetPriceLists(
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool validOnly = false)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetPriceListsQuery
        {
            TenantId = tenantId,
            IncludeInactive = includeInactive,
            ValidOnly = validOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get price list by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PriceListDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PriceListDto>> GetPriceList(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetPriceListByIdQuery
        {
            TenantId = tenantId,
            PriceListId = id
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new price list
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PriceListDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<PriceListDto>> CreatePriceList([FromBody] CreatePriceListDto data)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new CreatePriceListCommand
        {
            TenantId = tenantId,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetPriceList), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a price list
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(PriceListDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PriceListDto>> UpdatePriceList(int id, [FromBody] UpdatePriceListDto data)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new UpdatePriceListCommand
        {
            TenantId = tenantId,
            PriceListId = id,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a price list
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeletePriceList(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeletePriceListCommand
        {
            TenantId = tenantId,
            PriceListId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Set a price list as default
    /// </summary>
    [HttpPost("{id}/set-default")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> SetDefaultPriceList(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new SetDefaultPriceListCommand
        {
            TenantId = tenantId,
            PriceListId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Activate a price list
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ActivatePriceList(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new ActivatePriceListCommand
        {
            TenantId = tenantId,
            PriceListId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Deactivate a price list
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeactivatePriceList(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeactivatePriceListCommand
        {
            TenantId = tenantId,
            PriceListId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok();
    }

    /// <summary>
    /// Add an item to a price list
    /// </summary>
    [HttpPost("{id}/items")]
    [ProducesResponseType(typeof(PriceListItemDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PriceListItemDto>> AddPriceListItem(int id, [FromBody] CreatePriceListItemDto data)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new AddPriceListItemCommand
        {
            TenantId = tenantId,
            PriceListId = id,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetPriceList), new { id }, result.Value);
    }

    /// <summary>
    /// Update an item in a price list
    /// </summary>
    [HttpPut("{id}/items/{itemId}")]
    [ProducesResponseType(typeof(PriceListItemDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<PriceListItemDto>> UpdatePriceListItem(int id, int itemId, [FromBody] CreatePriceListItemDto data)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new UpdatePriceListItemCommand
        {
            TenantId = tenantId,
            PriceListId = id,
            ItemId = itemId,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Remove an item from a price list
    /// </summary>
    [HttpDelete("{id}/items/{itemId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RemovePriceListItem(int id, int itemId)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new RemovePriceListItemCommand
        {
            TenantId = tenantId,
            PriceListId = id,
            ItemId = itemId
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Get price for a product from price lists
    /// </summary>
    [HttpGet("product-price/{productId}")]
    [ProducesResponseType(typeof(ProductPriceDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductPriceDto>> GetProductPrice(
        int productId,
        [FromQuery] int? priceListId = null,
        [FromQuery] int? customerGroupId = null,
        [FromQuery] decimal? quantity = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductPriceQuery
        {
            TenantId = tenantId,
            ProductId = productId,
            PriceListId = priceListId,
            CustomerGroupId = customerGroupId,
            Quantity = quantity
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(result.Value);
    }

    private int GetTenantId()
    {
        if (HttpContext.Items["TenantId"] is int tenantId)
            return tenantId;
        if (HttpContext.Items["TenantId"] is Guid guidTenantId)
            return guidTenantId.GetHashCode();
        return 0;
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
