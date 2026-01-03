using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Referrals.Commands;
using Stocker.Modules.CRM.Application.Features.Referrals.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/referrals")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class ReferralsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReferralsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetReferrals(
        [FromQuery] ReferralStatus? status = null,
        [FromQuery] ReferralType? type = null,
        [FromQuery] Guid? referrerCustomerId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetReferralsQuery
        {
            Status = status,
            ReferralType = type,
            ReferrerCustomerId = referrerCustomerId,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetReferral(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetReferralByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);

        return result != null
            ? Ok(result)
            : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateReferral(
        [FromBody] CreateReferralRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new CreateReferralCommand(
            TenantId: tenantId,
            ReferrerName: request.ReferrerName,
            ReferredName: request.ReferredName,
            ReferralCode: request.ReferralCode,
            ReferralType: request.ReferralType ?? ReferralType.Customer,
            ReferrerCustomerId: request.ReferrerCustomerId,
            ReferrerContactId: request.ReferrerContactId,
            ReferrerEmail: request.ReferrerEmail,
            ReferrerPhone: request.ReferrerPhone,
            ReferredEmail: request.ReferredEmail,
            ReferredPhone: request.ReferredPhone,
            ReferredCompany: request.ReferredCompany,
            ReferrerReward: request.ReferrerReward,
            ReferredReward: request.ReferredReward,
            RewardType: request.RewardType,
            Currency: request.Currency ?? "TRY",
            ExpiryDate: request.ExpiryDate,
            CampaignId: request.CampaignId,
            ProgramName: request.ProgramName,
            ReferralMessage: request.ReferralMessage,
            InternalNotes: request.InternalNotes,
            AssignedToUserId: request.AssignedToUserId);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetReferral), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    // TODO: Add commands for the following specialized operations:
    // - MarkAsContacted, MarkAsQualified, MarkAsConverted
    // - Reject, SetRewards, PayReward

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReferral(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteReferralCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }
}

public record CreateReferralRequest(
    string ReferrerName,
    string ReferredName,
    string? ReferralCode = null,
    ReferralType? ReferralType = null,
    Guid? ReferrerCustomerId = null,
    Guid? ReferrerContactId = null,
    string? ReferrerEmail = null,
    string? ReferrerPhone = null,
    string? ReferredEmail = null,
    string? ReferredPhone = null,
    string? ReferredCompany = null,
    decimal? ReferrerReward = null,
    decimal? ReferredReward = null,
    RewardType? RewardType = null,
    string? Currency = null,
    DateTime? ExpiryDate = null,
    Guid? CampaignId = null,
    string? ProgramName = null,
    string? ReferralMessage = null,
    string? InternalNotes = null,
    int? AssignedToUserId = null);

public record MarkAsConvertedRequest(decimal? ConversionValue = null);

public record RejectReferralRequest(string Reason);

public record SetRewardsRequest(
    decimal? ReferrerReward,
    decimal? ReferredReward,
    RewardType RewardType);
