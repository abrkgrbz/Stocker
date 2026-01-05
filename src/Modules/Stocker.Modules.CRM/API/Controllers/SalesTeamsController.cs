using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;
using Stocker.Modules.CRM.Application.Features.SalesTeams.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/sales-teams")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class SalesTeamsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesTeamsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetSalesTeams(
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSalesTeamsQuery
        {
            IsActive = isActive,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSalesTeam(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetSalesTeamByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        return result != null
            ? Ok(result)
            : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateSalesTeam(
        [FromBody] CreateSalesTeamRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new CreateSalesTeamCommand(
            TenantId: tenantId,
            Name: request.Name,
            Code: request.Code,
            Description: request.Description,
            IsActive: request.IsActive ?? true,
            TeamLeaderId: request.TeamLeaderId,
            TeamLeaderName: request.TeamLeaderName,
            ParentTeamId: request.ParentTeamId,
            SalesTarget: request.SalesTarget,
            TargetPeriod: request.TargetPeriod,
            Currency: request.Currency ?? "TRY",
            TerritoryId: request.TerritoryId,
            TerritoryNames: request.TerritoryNames,
            TeamEmail: request.TeamEmail,
            CommunicationChannel: request.CommunicationChannel);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetSalesTeam), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    // TODO: Add commands for the following specialized operations:
    // - AddMember, RemoveMember
    // - Activate, Deactivate

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalesTeam(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteSalesTeamCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

public record CreateSalesTeamRequest(
    string Name,
    string Code,
    string? Description = null,
    bool? IsActive = null,
    int? TeamLeaderId = null,
    string? TeamLeaderName = null,
    Guid? ParentTeamId = null,
    decimal? SalesTarget = null,
    string? TargetPeriod = null,
    string? Currency = null,
    Guid? TerritoryId = null,
    string? TerritoryNames = null,
    string? TeamEmail = null,
    string? CommunicationChannel = null);

public record AddMemberRequest(
    int UserId,
    SalesTeamRole Role,
    string? UserName = null);
