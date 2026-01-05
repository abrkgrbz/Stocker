using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.EmployeeAssets.Commands;
using Stocker.Modules.HR.Application.Features.EmployeeAssets.Queries;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/employee-assets")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeAssetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeeAssetsController(IMediator mediator)
    {
        _mediator = mediator;
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
    [ProducesResponseType(typeof(int), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> CreateEmployeeAsset(CreateEmployeeAssetCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(nameof(GetEmployeeAsset), new { id = result.Value }, result.Value);
    }

    /// <summary>
    /// Update an existing employee asset
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(int), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<int>> UpdateEmployeeAsset(int id, UpdateEmployeeAssetCommand command)
    {
        var commandWithId = command with { EmployeeAssetId = id };
        var result = await _mediator.Send(commandWithId);

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
        var command = new DeleteEmployeeAssetCommand { EmployeeAssetId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return NoContent();
    }
}
