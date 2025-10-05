using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Packages.Queries.GetPublicPackages;
using Stocker.Application.DTOs.Package;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Public endpoint for pricing page - no authentication required
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/public/packages")]
[SwaggerTag("Public Packages - Get subscription packages for pricing page (no auth required)")]
public class PublicPackagesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PublicPackagesController> _logger;

    public PublicPackagesController(
        IMediator mediator,
        ILogger<PublicPackagesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all public packages for pricing page
    /// </summary>
    /// <remarks>
    /// Returns all active, public packages with their features and modules.
    /// No authentication required - this endpoint is for the pricing page.
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(typeof(List<PackageDto>), 200)]
    public async Task<IActionResult> GetPublicPackages()
    {
        _logger.LogInformation("Getting public packages for pricing page");

        var query = new GetPublicPackagesQuery();
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Returned {Count} public packages", result.Value.Count);
            return Ok(result.Value);
        }

        _logger.LogWarning("Failed to get public packages: {Error}", result.Error?.Description);
        return BadRequest(new
        {
            success = false,
            message = result.Error?.Description ?? "Failed to retrieve public packages",
            timestamp = DateTime.UtcNow
        });
    }
}
