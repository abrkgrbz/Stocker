using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Territories.Commands;
using Stocker.Modules.CRM.Application.Features.Territories.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/territories")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class TerritoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TerritoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetTerritories(
        [FromQuery] bool? isActive = true,
        [FromQuery] TerritoryType? type = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetTerritoriesQuery(type, null, isActive, null, null, skip, take);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTerritory(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetTerritoryByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTerritory(
        [FromBody] CreateTerritoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new CreateTerritoryCommand(
            tenantId,
            request.Name,
            request.Code,
            request.TerritoryType,
            request.Description,
            null,
            request.Country,
            null,
            request.Region,
            request.City,
            request.District);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetTerritory), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTerritory(
        Guid id,
        [FromBody] UpdateTerritoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new UpdateTerritoryCommand(
            id,
            tenantId,
            request.Name,
            request.Code,
            request.Description,
            request.Country,
            request.Region,
            request.City,
            request.District,
            null,
            null,
            null,
            null,
            null,
            null,
            request.IsActive);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTerritory(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteTerritoryCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }

    // TODO: The following specialized methods require specific Commands to be created
    // Currently not migrated to MediatR pattern - require: AssignUserCommand,
    // RemoveUserAssignmentCommand, ActivateCommand, DeactivateCommand
}

public record CreateTerritoryRequest(
    string Name,
    string Code,
    TerritoryType TerritoryType = TerritoryType.Region,
    string? Description = null,
    string? Country = null,
    string? Region = null,
    string? City = null,
    string? District = null,
    decimal? SalesTarget = null,
    int? TargetYear = null);

public record UpdateTerritoryRequest(
    string? Name = null,
    string? Code = null,
    string? Description = null,
    TerritoryType? TerritoryType = null,
    string? Country = null,
    string? Region = null,
    string? City = null,
    string? District = null,
    bool? IsActive = null);

public record AssignUserRequest(
    int UserId,
    string? UserName = null,
    bool IsPrimary = false,
    decimal ResponsibilityPercentage = 100);
