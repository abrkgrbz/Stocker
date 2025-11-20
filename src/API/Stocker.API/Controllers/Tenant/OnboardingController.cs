using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.SharedKernel.Authorization;
using Stocker.Application.Features.Onboarding.Commands.CompleteOnboarding;
using Stocker.Application.Features.Onboarding.Queries.GetOnboardingStatus;
using System.Security.Claims;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Tenant;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SwaggerTag("Tenant - Onboarding")]
public class OnboardingController : ControllerBase
{
    private readonly ISender _sender;

    public OnboardingController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("status")]
    [RequireModule("Core")]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = User.FindFirstValue("TenantId");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(tenantId))
        {
            return Unauthorized(new { message = "User or tenant information not found" });
        }

        var query = new GetOnboardingStatusQuery
        {
            UserId = Guid.Parse(userId),
            TenantId = Guid.Parse(tenantId)
        };

        var result = await _sender.Send(query, cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        return BadRequest(new { message = result.Error });
    }

    [HttpPost("complete")]
    [RequireModule("Core")]
    public async Task<IActionResult> CompleteOnboarding(
        [FromBody] CompleteOnboardingRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var tenantId = User.FindFirstValue("TenantId");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(tenantId))
        {
            return Unauthorized(new { message = "User or tenant information not found" });
        }

        var command = new CompleteOnboardingCommand
        {
            UserId = Guid.Parse(userId),
            TenantId = Guid.Parse(tenantId),
            Sector = request.Sector,
            CompanyName = request.CompanyName,
            CompanyCode = request.CompanyCode,
            PackageId = request.PackageId,
            ContactPhone = request.ContactPhone
        };

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        return BadRequest(new { message = result.Error });
    }
}

public record CompleteOnboardingRequest
{
    public string? Sector { get; init; }
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCode { get; init; } = string.Empty;
    public string PackageId { get; init; } = string.Empty;
    public string? ContactPhone { get; init; }
}
