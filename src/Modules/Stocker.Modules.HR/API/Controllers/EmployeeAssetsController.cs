using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.EmployeeAssets.Commands;
using Stocker.Modules.HR.Application.Features.EmployeeAssets.Queries;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employee-assets")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeAssetsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public EmployeeAssetsController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all employee assets
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeAssetDto>), 200)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<EmployeeAssetDto>>> GetEmployeeAssets()
    {
        var result = await _mediator.Send(new GetEmployeeAssetsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get employee asset by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeAssetDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<EmployeeAssetDto>> GetEmployeeAsset(int id)
    {
        var result = await _mediator.Send(new GetEmployeeAssetByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Create a new employee asset
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> CreateEmployeeAsset(CreateEmployeeAssetCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployeeAsset), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing employee asset
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Guid), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<Guid>> UpdateEmployeeAsset(int id, UpdateEmployeeAssetCommand command)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var commandWithTenant = command with { TenantId = tenantId.Value, EmployeeAssetId = id };
        var result = await _mediator.Send(commandWithTenant);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete an employee asset
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteEmployeeAsset(int id)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue) return BadRequest("Tenant ID is required");

        var command = new DeleteEmployeeAssetCommand { TenantId = tenantId.Value, EmployeeAssetId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
