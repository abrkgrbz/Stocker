using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.Pricing.Queries.Public;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Public pricing endpoints - No authentication required
/// These endpoints allow visitors to view pricing information before signing up
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/public/pricing")]
[SwaggerTag("Public - Pricing Information (No Auth Required)")]
public class PublicPricingController : ApiController
{
    /// <summary>
    /// Get all active module pricings
    /// </summary>
    [HttpGet("modules")]
    [SwaggerOperation(Summary = "Get module pricing list", Description = "Returns all active modules with their pricing information")]
    [ProducesResponseType(typeof(GetPublicModulesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetModules(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetPublicModulesQuery(), cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get all active module bundles
    /// </summary>
    [HttpGet("bundles")]
    [SwaggerOperation(Summary = "Get bundle pricing list", Description = "Returns all active bundles with included modules and pricing")]
    [ProducesResponseType(typeof(GetPublicBundlesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBundles(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetPublicBundlesQuery(), cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get all active add-ons
    /// </summary>
    [HttpGet("addons")]
    [SwaggerOperation(Summary = "Get add-on pricing list", Description = "Returns all active add-ons with their pricing")]
    [ProducesResponseType(typeof(GetPublicAddOnsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAddOns([FromQuery] string? moduleCode = null, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetPublicAddOnsQuery(moduleCode), cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get full pricing information (modules, bundles, and add-ons)
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Get full pricing information", Description = "Returns all modules, bundles, and add-ons in a single response")]
    [ProducesResponseType(typeof(GetPublicFullPricingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetFullPricing(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetPublicFullPricingQuery(), cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Calculate price preview for selected items
    /// </summary>
    [HttpPost("calculate")]
    [SwaggerOperation(Summary = "Calculate subscription price", Description = "Calculate total price for selected modules, bundles, add-ons and user count")]
    [ProducesResponseType(typeof(CalculatePublicPriceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CalculatePrice([FromBody] CalculatePriceRequest request, CancellationToken cancellationToken)
    {
        var query = new CalculatePublicPriceQuery
        {
            PackageId = request.PackageId,
            BundleCode = request.BundleCode,
            ModuleCodes = request.ModuleCodes,
            AddOnCodes = request.AddOnCodes,
            UserCount = request.UserCount,
            BillingCycle = request.BillingCycle
        };

        var result = await Mediator.Send(query, cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }
}

/// <summary>
/// Request model for price calculation
/// </summary>
public class CalculatePriceRequest
{
    public string? PackageId { get; set; }
    public string? BundleCode { get; set; }
    public List<string>? ModuleCodes { get; set; }
    public List<string>? AddOnCodes { get; set; }
    public int UserCount { get; set; } = 1;
    public string? BillingCycle { get; set; } = "monthly";
}
