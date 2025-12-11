using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;
using Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/loyalty-memberships")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class LoyaltyMembershipsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoyaltyMembershipsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetMemberships(
        [FromQuery] Guid? programId = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? currentTierId = null,
        [FromQuery] bool? isActive = true,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetLoyaltyMembershipsQuery(programId, customerId, currentTierId, isActive, skip, take);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMembership(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetLoyaltyMembershipByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpGet("by-customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(
        Guid customerId,
        [FromQuery] Guid? programId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetLoyaltyMembershipsQuery(programId, customerId, null, true, 0, 1);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMembership(
        [FromBody] CreateMembershipRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new CreateLoyaltyMembershipCommand(
            tenantId,
            request.ProgramId,
            request.CustomerId,
            request.MembershipNumber);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetMembership), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMembership(
        Guid id,
        [FromBody] UpdateMembershipRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new UpdateLoyaltyMembershipCommand(
            id,
            tenantId,
            request.CurrentTierId,
            request.CurrentPoints,
            null, // PointsToRedeem
            null, // PointsToAdjust
            null, // PointsToExpire
            request.Notes,
            null, // PointsExpiryDate
            request.IsActive);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMembership(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteLoyaltyMembershipCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }

    // TODO: The following specialized methods require specific Commands to be created
    // Currently not migrated to MediatR pattern - require: EarnPointsCommand,
    // RedeemPointsCommand, AdjustPointsCommand, GetTransactionsQuery,
    // ActivateCommand, DeactivateCommand
}

public record CreateMembershipRequest(
    Guid ProgramId,
    Guid CustomerId,
    string MembershipNumber);

public record UpdateMembershipRequest(
    int? CurrentPoints = null,
    int? LifetimePoints = null,
    Guid? CurrentTierId = null,
    bool? IsActive = null,
    string? Notes = null);

public record EarnPointsRequest(
    int Points,
    string Description,
    string? ReferenceNumber = null);

public record RedeemPointsRequest(
    int Points,
    string Description,
    string? ReferenceNumber = null);

public record AdjustPointsRequest(
    int Points,
    string Reason);
