using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;
using Stocker.Modules.Inventory.Application.Features.ProductBundles.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/product-bundles")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class ProductBundlesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public ProductBundlesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all product bundles
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductBundleDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ProductBundleDto>>> GetBundles(
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool validOnly = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetProductBundlesQuery
        {
            TenantId = tenantId.Value,
            IncludeInactive = includeInactive,
            ValidOnly = validOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get product bundle by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductBundleDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductBundleDto>> GetBundle(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetProductBundleByIdQuery
        {
            TenantId = tenantId.Value,
            BundleId = id
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
    /// Create a new product bundle
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductBundleDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductBundleDto>> CreateBundle(CreateProductBundleDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateProductBundleCommand
        {
            TenantId = tenantId.Value,
            BundleData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetBundle), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a product bundle
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductBundleDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductBundleDto>> UpdateBundle(int id, UpdateProductBundleDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateProductBundleCommand
        {
            TenantId = tenantId.Value,
            BundleId = id,
            BundleData = dto
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
    /// Delete a product bundle
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteBundle(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteProductBundleCommand
        {
            TenantId = tenantId.Value,
            BundleId = id
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

    #region Bundle Items

    /// <summary>
    /// Add an item to a product bundle
    /// </summary>
    [HttpPost("{bundleId}/items")]
    [ProducesResponseType(typeof(ProductBundleItemDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductBundleItemDto>> AddItem(int bundleId, CreateProductBundleItemDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new AddProductBundleItemCommand
        {
            TenantId = tenantId.Value,
            BundleId = bundleId,
            ItemData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Created($"/api/inventory/product-bundles/{bundleId}/items/{result.Value.Id}", result.Value);
    }

    /// <summary>
    /// Update a bundle item
    /// </summary>
    [HttpPut("{bundleId}/items/{itemId}")]
    [ProducesResponseType(typeof(ProductBundleItemDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductBundleItemDto>> UpdateItem(
        int bundleId, int itemId, UpdateProductBundleItemDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateProductBundleItemCommand
        {
            TenantId = tenantId.Value,
            BundleId = bundleId,
            ItemId = itemId,
            ItemData = dto
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
    /// Remove an item from a bundle
    /// </summary>
    [HttpDelete("{bundleId}/items/{itemId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveItem(int bundleId, int itemId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new RemoveProductBundleItemCommand
        {
            TenantId = tenantId.Value,
            BundleId = bundleId,
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

    #endregion

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
