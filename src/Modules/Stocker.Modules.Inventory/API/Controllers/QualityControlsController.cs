using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;
using Stocker.Modules.Inventory.Application.Features.QualityControls.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.API.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory/quality-controls")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class QualityControlsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public QualityControlsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all quality control records
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<QualityControlDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<QualityControlDto>>> GetQualityControls(
        [FromQuery] int? productId = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? qcType = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetQualityControlsQuery
        {
            TenantId = tenantId.Value,
            ProductId = productId,
            SupplierId = supplierId,
            Status = status,
            QcType = qcType
        };

        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get quality control by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(QualityControlDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<QualityControlDto>> GetQualityControl(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var query = new GetQualityControlByIdQuery
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
    /// Create a new quality control record
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(QualityControlDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<QualityControlDto>> CreateQualityControl(CreateQualityControlDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CreateQualityControlCommand
        {
            TenantId = tenantId.Value,
            Data = dto
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetQualityControl), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update a quality control record
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(QualityControlDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<QualityControlDto>> UpdateQualityControl(int id, UpdateQualityControlDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new UpdateQualityControlCommand
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
    /// Complete a quality control inspection
    /// </summary>
    [HttpPost("{id}/complete")]
    [ProducesResponseType(typeof(QualityControlDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<QualityControlDto>> CompleteQualityControl(int id, CompleteQualityControlDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new CompleteQualityControlCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Result = dto.Result,
            AcceptedQuantity = dto.AcceptedQuantity,
            RejectedQuantity = dto.RejectedQuantity,
            QualityScore = dto.QualityScore,
            QualityGrade = dto.QualityGrade,
            RejectionReason = dto.RejectionReason,
            RejectionCategory = dto.RejectionCategory
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
    /// Approve a quality control inspection (quick approval)
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(QualityControlDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<QualityControlDto>> ApproveQualityControl(int id, [FromBody] ApproveQualityControlDto? dto = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new ApproveQualityControlCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Notes = dto?.Notes
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
    /// Reject a quality control inspection
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(QualityControlDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<QualityControlDto>> RejectQualityControl(int id, [FromBody] RejectQualityControlDto? dto = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new RejectQualityControlCommand
        {
            TenantId = tenantId.Value,
            Id = id,
            Reason = dto?.Reason,
            Category = dto?.Category
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
    /// Delete a quality control record
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteQualityControl(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest(CreateTenantError());

        var command = new DeleteQualityControlCommand
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

    private static Error CreateTenantError()
    {
        return new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation);
    }
}
