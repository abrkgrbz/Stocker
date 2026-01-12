using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.Suppliers.Commands;
using Stocker.Modules.Inventory.Application.Features.Suppliers.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/suppliers")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class SuppliersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public SuppliersController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all suppliers
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SupplierListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<SupplierListDto>>> GetSuppliers(
        [FromQuery] bool includeInactive = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetSuppliersQuery
        {
            TenantId = tenantId.Value,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get supplier by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SupplierDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetSupplierByIdQuery
        {
            TenantId = tenantId.Value,
            SupplierId = id
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
    /// Create a new supplier
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SupplierDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SupplierDto>> CreateSupplier(CreateSupplierDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateSupplierCommand
        {
            TenantId = tenantId.Value,
            SupplierData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetSupplier), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a supplier
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SupplierDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SupplierDto>> UpdateSupplier(int id, UpdateSupplierDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateSupplierCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id,
            SupplierData = dto
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
    /// Delete a supplier
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteSupplierCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id
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
    /// Activate a supplier
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ActivateSupplier(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ActivateSupplierCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(new { message = "Tedarikçi başarıyla aktifleştirildi" });
    }

    /// <summary>
    /// Deactivate a supplier
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeactivateSupplier(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeactivateSupplierCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(new { message = "Tedarikçi başarıyla pasifleştirildi" });
    }

    #region Supplier Products

    /// <summary>
    /// Add a product to supplier
    /// </summary>
    [HttpPost("{id}/products")]
    [ProducesResponseType(typeof(SupplierProductDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SupplierProductDto>> AddProduct(int id, [FromBody] CreateSupplierProductDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        // Ensure supplierId in DTO matches route
        dto.SupplierId = id;

        var command = new AddSupplierProductCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id,
            ProductData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetSupplier), new { id }, result.Value);
    }

    /// <summary>
    /// Update a supplier product
    /// </summary>
    [HttpPut("{id}/products/{productId}")]
    [ProducesResponseType(typeof(SupplierProductDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SupplierProductDto>> UpdateProduct(int id, int productId, [FromBody] UpdateSupplierProductDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateSupplierProductCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id,
            SupplierProductId = productId,
            ProductData = dto
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
    /// Remove a product from supplier
    /// </summary>
    [HttpDelete("{id}/products/{productId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RemoveProduct(int id, int productId)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new RemoveSupplierProductCommand
        {
            TenantId = tenantId.Value,
            SupplierId = id,
            SupplierProductId = productId
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
        return new Error("Tenant.Required", "Kiracı kimliği gereklidir", ErrorType.Validation);
    }
}
