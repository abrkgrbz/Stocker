using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums.CMS;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public.CMS;

/// <summary>
/// Public CMS Pages API - No authentication required
/// Used by the public frontend to display CMS-managed pages
/// </summary>
[ApiController]
[Route("api/cms/pages")]
[AllowAnonymous]
[SwaggerTag("Public CMS - Pages for public website")]
public class PublicCmsPagesController : ControllerBase
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<PublicCmsPagesController> _logger;

    public PublicCmsPagesController(
        IMasterDbContext context,
        ILogger<PublicCmsPagesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all published CMS pages
    /// </summary>
    [HttpGet("published")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetPublishedPages()
    {
        _logger.LogInformation("Getting published CMS pages");

        var pages = await _context.CmsPages
            .Where(p => p.Status == PageStatus.Published)
            .OrderBy(p => p.Title)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.MetaTitle,
                p.MetaDescription,
                p.FeaturedImage,
                p.PublishedAt,
                p.UpdatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = pages });
    }

    /// <summary>
    /// Get a published CMS page by slug
    /// </summary>
    [HttpGet("slug/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPageBySlug(string slug)
    {
        _logger.LogInformation("Getting CMS page by slug: {Slug}", slug);

        var page = await _context.CmsPages
            .Where(p => p.Slug == slug && p.Status == PageStatus.Published)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Content,
                p.MetaTitle,
                p.MetaDescription,
                p.FeaturedImage,
                p.Status,
                p.PublishedAt,
                p.UpdatedAt,
                p.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (page == null)
        {
            _logger.LogWarning("CMS page not found: {Slug}", slug);
            return NotFound(new { success = false, message = "Page not found" });
        }

        return Ok(new { success = true, data = page });
    }

    /// <summary>
    /// Get a CMS page by slug for preview (any status)
    /// Requires CMS_PREVIEW_SECRET for authentication
    /// </summary>
    [HttpGet("preview-public/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPagePreview(string slug, [FromQuery] string secret)
    {
        _logger.LogInformation("Getting CMS page preview for: {Slug}", slug);

        // Validate preview secret
        var previewSecret = Environment.GetEnvironmentVariable("CMS_PREVIEW_SECRET");
        if (string.IsNullOrEmpty(previewSecret))
        {
            _logger.LogWarning("CMS_PREVIEW_SECRET not configured");
            return StatusCode(500, new { success = false, message = "Preview not configured" });
        }

        if (secret != previewSecret)
        {
            _logger.LogWarning("Invalid preview secret for slug: {Slug}", slug);
            return Unauthorized(new { success = false, message = "Invalid preview secret" });
        }

        var page = await _context.CmsPages
            .Where(p => p.Slug == slug)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Content,
                p.MetaTitle,
                p.MetaDescription,
                p.FeaturedImage,
                Status = p.Status.ToString(),
                p.PublishedAt,
                p.UpdatedAt,
                p.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (page == null)
        {
            _logger.LogWarning("CMS page not found for preview: {Slug}", slug);
            return NotFound(new { success = false, message = "Page not found" });
        }

        return Ok(new { success = true, data = page });
    }
}
