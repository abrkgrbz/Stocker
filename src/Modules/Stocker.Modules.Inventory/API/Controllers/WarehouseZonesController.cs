using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.WarehouseZones.Commands;
using Stocker.Modules.Inventory.Application.Features.WarehouseZones.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/warehouse-zones")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class WarehouseZonesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public WarehouseZonesController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all warehouse zones
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<WarehouseZoneDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<WarehouseZoneDto>>> GetWarehouseZones(
        [FromQuery] int? warehouseId = null,
        [FromQuery] string? zoneType = null,
        [FromQuery] bool? isActive = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWarehouseZonesQuery
        {
            TenantId = tenantId.Value,
            WarehouseId = warehouseId,
            ZoneType = zoneType,
            IncludeInactive = isActive == false || isActive == null
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get warehouse zone by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WarehouseZoneDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<WarehouseZoneDto>> GetWarehouseZone(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetWarehouseZoneByIdQuery
        {
            TenantId = tenantId.Value,
            Id = id
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
    /// Create a new warehouse zone
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(WarehouseZoneDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<WarehouseZoneDto>> CreateWarehouseZone(CreateWarehouseZoneDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateWarehouseZoneCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetWarehouseZone), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a warehouse zone
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(WarehouseZoneDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<WarehouseZoneDto>> UpdateWarehouseZone(int id, UpdateWarehouseZoneDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateWarehouseZoneCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Data = dto
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
    /// Delete a warehouse zone
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteWarehouseZone(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteWarehouseZoneCommand
        {
            TenantId = tenantId.Value,
            Id = id
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
    /// Activate a warehouse zone
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ActivateWarehouseZone(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ActivateWarehouseZoneCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(new { message = "Depo bölgesi başarıyla aktifleştirildi" });
    }

    /// <summary>
    /// Deactivate a warehouse zone
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeactivateWarehouseZone(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeactivateWarehouseZoneCommand
        {
            TenantId = tenantId.Value,
            Id = id
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return Ok(new { message = "Depo bölgesi başarıyla pasifleştirildi" });
    }

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Kiracı kimliği gereklidir", ErrorType.Validation);
    }
}
