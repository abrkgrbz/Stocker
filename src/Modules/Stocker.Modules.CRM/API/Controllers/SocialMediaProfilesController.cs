using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;
using Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Authorization;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/social-profiles")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class SocialMediaProfilesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SocialMediaProfilesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetProfiles(
        [FromQuery] Guid? customerId = null,
        [FromQuery] SocialMediaPlatform? platform = null,
        [FromQuery] bool? isActive = true,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSocialMediaProfilesQuery(platform, customerId, null, isActive, skip, take);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(Guid id, CancellationToken cancellationToken = default)
    {
        var query = new GetSocialMediaProfileByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpGet("by-customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(Guid customerId, CancellationToken cancellationToken = default)
    {
        var query = new GetSocialMediaProfilesQuery(null, customerId, null, true, 0, 100);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProfile(
        [FromBody] CreateSocialProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new CreateSocialMediaProfileCommand(
            tenantId,
            request.Platform,
            request.ProfileUrl,
            request.Username,
            null,
            request.CustomerId,
            request.ContactId,
            null,
            request.DisplayName,
            request.Bio);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetProfile), new { id = result.Value }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(
        Guid id,
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();

        var command = new UpdateSocialMediaProfileCommand(
            id,
            tenantId,
            request.Username,
            null,
            request.DisplayName,
            request.Bio,
            request.ProfileImageUrl,
            null,
            request.Website,
            request.Location,
            request.FollowersCount,
            request.FollowingCount,
            request.PostsCount,
            request.LikesCount,
            request.EngagementRate,
            request.IsActive,
            null,
            request.Notes,
            request.Tags);

        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : NotFound(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProfile(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = GetTenantId();
        var command = new DeleteSocialMediaProfileCommand(id, tenantId);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : NotFound(result.Error);
    }

    // TODO: The following specialized methods require specific Commands to be created
    // Currently not migrated to MediatR pattern - require: RecordInteractionCommand,
    // RecordBrandMentionCommand, SetFollowsBrandCommand, StartCampaignCommand,
    // EndCampaignCommand, ActivateCommand, DeactivateCommand, GetInfluencersQuery
}

public record CreateSocialProfileRequest(
    SocialMediaPlatform Platform,
    string ProfileUrl,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    string? Username = null,
    string? DisplayName = null,
    string? Bio = null);

public record UpdateProfileRequest(
    string? Username = null,
    string? DisplayName = null,
    string? Bio = null,
    string? ProfileImageUrl = null,
    string? Website = null,
    string? Location = null,
    int? FollowersCount = null,
    int? FollowingCount = null,
    int? PostsCount = null,
    int? LikesCount = null,
    decimal? EngagementRate = null,
    bool? IsActive = null,
    string? Notes = null,
    string? Tags = null);
