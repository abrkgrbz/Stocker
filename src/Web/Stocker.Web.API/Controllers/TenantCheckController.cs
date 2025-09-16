using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Tenants.Queries.GetTenantBySlug;

namespace Stocker.Web.API.Controllers;

[ApiController]
[Route("api/tenants")]
[AllowAnonymous]
public class TenantCheckController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TenantCheckController> _logger;

    public TenantCheckController(IMediator mediator, ILogger<TenantCheckController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Check if a tenant exists by slug (subdomain)
    /// </summary>
    [HttpGet("check/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckTenant(string slug)
    {
        try
        {
            _logger.LogInformation("Checking tenant existence for slug: {Slug}", slug);

            var query = new GetTenantBySlugQuery { Slug = slug };
            var result = await _mediator.Send(query);

            // Return in camelCase for JavaScript frontend
            return Ok(new
            {
                exists = result.Exists,
                isActive = result.IsActive,
                id = result.Id,
                name = result.Name,
                slug = result.Slug,
                primaryColor = result.PrimaryColor,
                secondaryColor = result.SecondaryColor,
                logo = result.Logo,
                message = result.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking tenant existence for slug: {Slug}", slug);
            
            // In development, return mock data
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                return Ok(new
                {
                    exists = true,
                    isActive = true,
                    id = Guid.NewGuid(),
                    name = $"{slug} Company",
                    slug = slug,
                    primaryColor = "#667eea",
                    secondaryColor = "#764ba2",
                    logo = (string?)null,
                    message = (string?)null
                });
            }

            return StatusCode(500, new { message = "An error occurred while checking tenant" });
        }
    }
}