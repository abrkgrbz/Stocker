using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Master;

namespace Stocker.Web.API.Controllers;

[ApiController]
[Route("api/tenants")]
[AllowAnonymous]
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
    [HttpGet("check/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckTenant(string slug)
    {
        try
        {
            _logger.LogInformation("Checking tenant existence for slug: {Slug}", slug);

            // Normalize slug
            var normalizedSlug = slug.ToLowerInvariant().Trim();

            // Query tenant by slug or identifier
            var tenant = await _context.Tenants
                .Where(t => t.Identifier.ToLower() == normalizedSlug || 
                           (t.Slug != null && t.Slug.ToLower() == normalizedSlug))
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Identifier,
                    t.Slug,
                    t.IsActive,
                    t.Settings
                })
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                _logger.LogWarning("No tenant found with slug: {Slug}", slug);
                return Ok(new
                {
                    exists = false,
                    isActive = false,
                    message = $"No tenant found with slug: {slug}"
                });
            }

            // Parse settings if they exist
            string? primaryColor = null;
            string? secondaryColor = null;
            string? logo = null;

            if (!string.IsNullOrEmpty(tenant.Settings))
            {
                try
                {
                    var settings = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(tenant.Settings);
                    if (settings != null)
                    {
                        primaryColor = settings.ContainsKey("primaryColor") ? settings["primaryColor"]?.ToString() : null;
                        secondaryColor = settings.ContainsKey("secondaryColor") ? settings["secondaryColor"]?.ToString() : null;
                        logo = settings.ContainsKey("logo") ? settings["logo"]?.ToString() : null;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing tenant settings for tenant {TenantId}", tenant.Id);
                }
            }

            return Ok(new
            {
                exists = true,
                isActive = tenant.IsActive,
                id = tenant.Id,
                name = tenant.Name,
                slug = tenant.Slug ?? tenant.Identifier,
                primaryColor = primaryColor ?? "#667eea",
                secondaryColor = secondaryColor ?? "#764ba2",
                logo = logo
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
                    logo = (string?)null
                });
            }

            return StatusCode(500, new { message = "An error occurred while checking tenant" });
        }
    }
}