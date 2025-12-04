using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;
using Stocker.Modules.Inventory.Application.Features.ProductAttributes.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/product-attributes")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class ProductAttributesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductAttributesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all product attributes
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductAttributeDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ProductAttributeDto>>> GetAttributes(
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool filterableOnly = false)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductAttributesQuery
        {
            TenantId = tenantId,
            IncludeInactive = includeInactive,
            FilterableOnly = filterableOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get product attribute by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductAttributeDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductAttributeDto>> GetAttribute(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetProductAttributeByIdQuery
        {
            TenantId = tenantId,
            AttributeId = id
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
    /// Create a new product attribute
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductAttributeDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ProductAttributeDto>> CreateAttribute(CreateProductAttributeDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new CreateProductAttributeCommand
        {
            TenantId = tenantId,
            AttributeData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetAttribute), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a product attribute
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductAttributeDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductAttributeDto>> UpdateAttribute(int id, UpdateProductAttributeDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new UpdateProductAttributeCommand
        {
            TenantId = tenantId,
            AttributeId = id,
            AttributeData = dto
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
    /// Delete a product attribute
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteAttribute(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeleteProductAttributeCommand
        {
            TenantId = tenantId,
            AttributeId = id
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

    #region Attribute Options

    /// <summary>
    /// Add an option to a product attribute
    /// </summary>
    [HttpPost("{attributeId}/options")]
    [ProducesResponseType(typeof(ProductAttributeOptionDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductAttributeOptionDto>> AddOption(int attributeId, CreateProductAttributeOptionDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new AddProductAttributeOptionCommand
        {
            TenantId = tenantId,
            AttributeId = attributeId,
            OptionData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Created($"/api/inventory/product-attributes/{attributeId}/options/{result.Value.Id}", result.Value);
    }

    /// <summary>
    /// Update an attribute option
    /// </summary>
    [HttpPut("{attributeId}/options/{optionId}")]
    [ProducesResponseType(typeof(ProductAttributeOptionDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ProductAttributeOptionDto>> UpdateOption(
        int attributeId, int optionId, UpdateProductAttributeOptionDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new UpdateProductAttributeOptionCommand
        {
            TenantId = tenantId,
            AttributeId = attributeId,
            OptionId = optionId,
            OptionData = dto
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
    /// Delete an attribute option
    /// </summary>
    [HttpDelete("{attributeId}/options/{optionId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteOption(int attributeId, int optionId)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new DeleteProductAttributeOptionCommand
        {
            TenantId = tenantId,
            AttributeId = attributeId,
            OptionId = optionId
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
