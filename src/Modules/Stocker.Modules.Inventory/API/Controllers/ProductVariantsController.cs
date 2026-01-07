using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.ProductVariants.Commands;
using Stocker.Modules.Inventory.Application.Features.ProductVariants.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/product-variants")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class ProductVariantsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public ProductVariantsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all variants, optionally filtered by product
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductVariantDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ProductVariantDto>>> GetVariants(
        [FromQuery] int? productId = null,
        [FromQuery] bool includeInactive = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        // If productId is provided, get variants for that product
        if (productId.HasValue && productId.Value > 0)
        {
            var query = new GetProductVariantsQuery
            {
                TenantId = tenantId.Value,
                ProductId = productId.Value,
                IncludeInactive = includeInactive
            };

            var result = await _mediator.Send(query);

            if (result.IsFailure)
                return BadRequest(result.Error);

            return Ok(result.Value);
        }

        // Otherwise, get all variants
        var allQuery = new GetAllProductVariantsQuery
        {
            TenantId = tenantId.Value,
            IncludeInactive = includeInactive
        };

        var allResult = await _mediator.Send(allQuery);

        if (allResult.IsFailure)
            return BadRequest(allResult.Error);

        return Ok(allResult.Value);
    }

    /// <summary>
    /// Get product variant by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductVariantDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductVariantDto>> GetVariant(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetProductVariantByIdQuery
        {
            TenantId = tenantId.Value,
            VariantId = id
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
    /// Create a new product variant
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductVariantDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductVariantDto>> CreateVariant(CreateProductVariantDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateProductVariantCommand
        {
            TenantId = tenantId.Value,
            VariantData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetVariant), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a product variant
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductVariantDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductVariantDto>> UpdateVariant(int id, UpdateProductVariantDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateProductVariantCommand
        {
            TenantId = tenantId.Value,
            VariantId = id,
            VariantData = dto
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
    /// Delete a product variant
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteVariant(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteProductVariantCommand
        {
            TenantId = tenantId.Value,
            VariantId = id
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

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
