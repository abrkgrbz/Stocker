using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public;

[ApiController]
[Route("api/public/tenants")]
[AllowAnonymous]
[ApiExplorerSettings(GroupName = "public")]
[SwaggerTag("Public tenant validation endpoints")]
public class TenantCheckController : ControllerBase
{
    private readonly MasterDbContext _context;
    private readonly ILogger<TenantCheckController> _logger;

    public TenantCheckController(MasterDbContext context, ILogger<TenantCheckController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Check if a tenant exists by slug (subdomain)
    /// </summary>
    /// <param name="slug">The tenant slug (subdomain) to check</param>
    /// <returns>Tenant existence and activation status</returns>
    /// <response code="200">Returns tenant status and details</response>
    /// <response code="500">Server error</response>
    [HttpGet("check/{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(500)]
    [SwaggerOperation(
        Summary = "Check tenant existence by slug",
        Description = "Validates if a tenant exists and is active by checking the subdomain slug",
        OperationId = "CheckTenant",
        Tags = new[] { "public" }
    )]
    public async Task<IActionResult> CheckTenant(string slug)
    {
        try
        {
            _logger.LogInformation("Checking tenant existence for slug: {Slug}", slug);

            // Normalize slug
            var normalizedSlug = slug.ToLowerInvariant().Trim();
            
            // Create full domain to check
            var fullDomain = $"{normalizedSlug}.stoocker.app";

            // First, check TenantDomains table for custom domains
            var tenantDomain = await _context.TenantDomains
                .Where(td => td.DomainName.ToLower() == fullDomain)
                .Select(td => new { td.TenantId })
                .FirstOrDefaultAsync();

            Guid? tenantId = tenantDomain?.TenantId;

            // Check Tenants table by ID or code
            var tenant = await _context.Tenants
                .Where(t => (tenantId != null && t.Id == tenantId) ||
                           t.Code.ToLower() == normalizedSlug ||
                           t.Name.ToLower() == normalizedSlug)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Code,
                    t.IsActive,
                    t.LogoUrl
                })
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                _logger.LogWarning("No tenant found with slug: {Slug} or domain: {Domain}", slug, fullDomain);
                return Ok(new
                {
                    exists = false,
                    isActive = false,
                    message = $"No tenant found with slug: {slug}"
                });
            }

            // TenantSettings moved to Tenant domain - use default values for now
            // Settings should be retrieved from Tenant context
            string? primaryColor = "#667eea";
            string? secondaryColor = "#764ba2";
            string? logo = tenant.LogoUrl;

            return Ok(new
            {
                exists = true,
                isActive = tenant.IsActive,
                id = tenant.Id,
                name = tenant.Name,
                slug = tenant.Code,
                primaryColor = primaryColor,
                secondaryColor = secondaryColor,
                logo = logo,
                message = tenant.IsActive ? null : "Tenant is not active"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking tenant existence for slug: {Slug}", slug);

            // In development, return mock data for testing
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