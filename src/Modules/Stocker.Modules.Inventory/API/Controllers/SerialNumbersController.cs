using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;
using Stocker.Modules.Inventory.Application.Features.SerialNumbers.Queries;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/serial-numbers")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class SerialNumbersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public SerialNumbersController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all serial numbers with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SerialNumberListDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<SerialNumberListDto>>> GetSerialNumbers(
        [FromQuery] int? productId = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] SerialNumberStatus? status = null,
        [FromQuery] bool underWarrantyOnly = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetSerialNumbersQuery
        {
            TenantId = tenantId.Value,
            ProductId = productId,
            WarehouseId = warehouseId,
            Status = status,
            UnderWarrantyOnly = underWarrantyOnly
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get serial number by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SerialNumberDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SerialNumberDto>> GetSerialNumber(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetSerialNumberByIdQuery
        {
            TenantId = tenantId.Value,
            SerialNumberId = id
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
    /// Create a new serial number
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SerialNumberDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<SerialNumberDto>> CreateSerialNumber([FromBody] CreateSerialNumberDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateSerialNumberCommand
        {
            TenantId = tenantId.Value,
            Data = data
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.Conflict)
                return Conflict(result.Error);
            if (result.Error.Type == ErrorType.NotFound)
                return NotFound(result.Error);
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetSerialNumber), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a serial number
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SerialNumberDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SerialNumberDto>> UpdateSerialNumber(int id, [FromBody] UpdateSerialNumberDto data)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateSerialNumberCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id,
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
    /// Receive a serial number into inventory
    /// </summary>
    [HttpPost("{id}/receive")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ReceiveSerialNumber(int id, [FromBody] ReceiveSerialNumberRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ReceiveSerialNumberCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id,
            PurchaseOrderId = request?.PurchaseOrderId
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
    /// Reserve a serial number for a sales order
    /// </summary>
    [HttpPost("{id}/reserve")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ReserveSerialNumber(int id, [FromBody] ReserveSerialNumberRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ReserveSerialNumberCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id,
            SalesOrderId = request.SalesOrderId
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
    /// Release a reserved serial number
    /// </summary>
    [HttpPost("{id}/release")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ReleaseSerialNumber(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ReleaseSerialNumberCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id
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
    /// Sell a serial number to a customer
    /// </summary>
    [HttpPost("{id}/sell")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> SellSerialNumber(int id, [FromBody] SellSerialNumberRequest request)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new SellSerialNumberCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id,
            CustomerId = request.CustomerId,
            SalesOrderId = request.SalesOrderId,
            WarrantyMonths = request.WarrantyMonths
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
    /// Mark a serial number as defective
    /// </summary>
    [HttpPost("{id}/defective")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> MarkDefective(int id, [FromBody] ReasonRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new MarkDefectiveCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id,
            Reason = request?.Reason
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
    /// Scrap a serial number
    /// </summary>
    [HttpPost("{id}/scrap")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ScrapSerialNumber(int id, [FromBody] ReasonRequest? request = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ScrapSerialNumberCommand
        {
            TenantId = tenantId.Value,
            SerialNumberId = id,
            Reason = request?.Reason
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

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}

public class ReceiveSerialNumberRequest
{
    public Guid? PurchaseOrderId { get; set; }
}

public class ReserveSerialNumberRequest
{
    public Guid SalesOrderId { get; set; }
}

public class SellSerialNumberRequest
{
    public Guid CustomerId { get; set; }
    public Guid SalesOrderId { get; set; }
    public int? WarrantyMonths { get; set; }
}

public class ReasonRequest
{
    public string? Reason { get; set; }
}
