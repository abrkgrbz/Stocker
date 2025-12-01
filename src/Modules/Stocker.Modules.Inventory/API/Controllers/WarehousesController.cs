using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.Warehouses.Commands;
using Stocker.Modules.Inventory.Application.Features.Warehouses.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/warehouses")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class WarehousesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WarehousesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all warehouses
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<WarehouseDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<WarehouseDto>>> GetWarehouses(
        [FromQuery] bool includeInactive = false,
        [FromQuery] int? branchId = null)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetWarehousesQuery
        {
            TenantId = tenantId,
            IncludeInactive = includeInactive,
            BranchId = branchId
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get warehouse by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WarehouseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<WarehouseDto>> GetWarehouse(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetWarehouseByIdQuery
        {
            TenantId = tenantId,
            WarehouseId = id
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
    /// Get warehouse locations
    /// </summary>
    [HttpGet("{id}/locations")]
    [ProducesResponseType(typeof(List<LocationDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<LocationDto>>> GetWarehouseLocations(int id)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var query = new GetWarehouseLocationsQuery
        {
            TenantId = tenantId,
            WarehouseId = id
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
    /// Create a new warehouse
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(WarehouseDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse(CreateWarehouseDto dto)
    {
        var tenantId = GetTenantId();
        if (tenantId == 0) return BadRequest(CreateTenantError());

        var command = new CreateWarehouseCommand
        {
            TenantId = tenantId,
            WarehouseData = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetWarehouse), new { id = result.Value.Id }, result.Value);
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
