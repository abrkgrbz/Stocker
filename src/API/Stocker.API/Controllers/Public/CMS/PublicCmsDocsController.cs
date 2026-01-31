using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums.CMS;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public.CMS;

/// <summary>
/// Public CMS Docs API - No authentication required
/// Used by the public frontend to display documentation
/// </summary>
[ApiController]
[Route("api/cms/docs")]
[AllowAnonymous]
[SwaggerTag("Public CMS - Documentation for public website")]
public class PublicCmsDocsController : ControllerBase
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<PublicCmsDocsController> _logger;

    public PublicCmsDocsController(
        IMasterDbContext context,
        ILogger<PublicCmsDocsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get active documentation categories (folders)
    /// </summary>
    [HttpGet("categories/active")]
    [ProducesResponseType(200)]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetActiveCategories()
    {
        _logger.LogInformation("Getting active doc categories");

        var categories = await _context.DocItems
            .Where(d => d.IsActive && d.Type == DocItemType.Folder && d.ParentId == null)
            .OrderBy(d => d.Order)
            .ThenBy(d => d.Title)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Icon,
                d.Order,
                ArticleCount = _context.DocItems.Count(c => c.ParentId == d.Id && c.Type == DocItemType.File && c.IsActive)
            })
            .ToListAsync();

        return Ok(new { success = true, data = categories });
    }

    /// <summary>
    /// Get doc category by slug
    /// </summary>
    [HttpGet("categories/slug/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetCategoryBySlug(string slug)
    {
        _logger.LogInformation("Getting doc category by slug: {Slug}", slug);

        var category = await _context.DocItems
            .Where(d => d.Slug == slug && d.Type == DocItemType.Folder && d.IsActive)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Icon,
                d.Order,
                d.CreatedAt,
                d.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (category == null)
        {
            _logger.LogWarning("Doc category not found: {Slug}", slug);
            return NotFound(new { success = false, message = "Category not found" });
        }

        return Ok(new { success = true, data = category });
    }

    /// <summary>
    /// Get active documentation articles
    /// </summary>
    [HttpGet("articles/active")]
    [ProducesResponseType(200)]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetActiveArticles()
    {
        _logger.LogInformation("Getting active doc articles");

        var articles = await _context.DocItems
            .Where(d => d.IsActive && d.Type == DocItemType.File)
            .OrderBy(d => d.Order)
            .ThenBy(d => d.Title)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Icon,
                d.Order,
                d.ParentId,
                d.CreatedAt,
                d.UpdatedAt,
                Category = d.Parent != null ? new
                {
                    d.Parent.Id,
                    d.Parent.Title,
                    d.Parent.Slug
                } : null
            })
            .ToListAsync();

        return Ok(new { success = true, data = articles });
    }

    /// <summary>
    /// Get popular documentation articles (most recently updated)
    /// </summary>
    [HttpGet("articles/popular")]
    [ProducesResponseType(200)]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetPopularArticles([FromQuery] int limit = 5)
    {
        _logger.LogInformation("Getting popular doc articles, limit: {Limit}", limit);

        var articles = await _context.DocItems
            .Where(d => d.IsActive && d.Type == DocItemType.File)
            .OrderByDescending(d => d.UpdatedAt ?? d.CreatedAt)
            .Take(limit)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Icon,
                d.Order,
                d.ParentId,
                d.CreatedAt,
                d.UpdatedAt,
                Category = d.Parent != null ? new
                {
                    d.Parent.Id,
                    d.Parent.Title,
                    d.Parent.Slug
                } : null
            })
            .ToListAsync();

        return Ok(new { success = true, data = articles });
    }

    /// <summary>
    /// Get articles by category
    /// </summary>
    [HttpGet("articles/category/{categoryId}")]
    [ProducesResponseType(200)]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetArticlesByCategory(Guid categoryId)
    {
        _logger.LogInformation("Getting doc articles for category: {CategoryId}", categoryId);

        var articles = await _context.DocItems
            .Where(d => d.ParentId == categoryId && d.Type == DocItemType.File && d.IsActive)
            .OrderBy(d => d.Order)
            .ThenBy(d => d.Title)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Icon,
                d.Order,
                d.CreatedAt,
                d.UpdatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = articles });
    }

    /// <summary>
    /// Get doc article by slug
    /// </summary>
    [HttpGet("articles/slug/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetArticleBySlug(string slug)
    {
        _logger.LogInformation("Getting doc article by slug: {Slug}", slug);

        var article = await _context.DocItems
            .Where(d => d.Slug == slug && d.Type == DocItemType.File && d.IsActive)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Content,
                d.Icon,
                d.Order,
                d.ParentId,
                d.CreatedAt,
                d.UpdatedAt,
                Category = d.Parent != null ? new
                {
                    d.Parent.Id,
                    d.Parent.Title,
                    d.Parent.Slug
                } : null,
                Author = d.Author != null ? new
                {
                    d.Author.Id,
                    Name = d.Author.FirstName + " " + d.Author.LastName,
                    Avatar = d.Author.ProfilePictureUrl
                } : null
            })
            .FirstOrDefaultAsync();

        if (article == null)
        {
            _logger.LogWarning("Doc article not found: {Slug}", slug);
            return NotFound(new { success = false, message = "Article not found" });
        }

        return Ok(new { success = true, data = article });
    }

    /// <summary>
    /// Search documentation articles
    /// </summary>
    [HttpGet("articles/search")]
    [ProducesResponseType(200)]
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "q" })]
    public async Task<IActionResult> SearchArticles([FromQuery] string q)
    {
        _logger.LogInformation("Searching doc articles: {Query}", q);

        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new { success = true, data = Array.Empty<object>() });
        }

        var searchTerm = q.ToLower();
        var articles = await _context.DocItems
            .Where(d => d.IsActive && d.Type == DocItemType.File &&
                       (d.Title.ToLower().Contains(searchTerm) ||
                        (d.Content != null && d.Content.ToLower().Contains(searchTerm))))
            .OrderBy(d => d.Title)
            .Take(20)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Icon,
                d.Order,
                d.ParentId,
                d.CreatedAt,
                d.UpdatedAt,
                Category = d.Parent != null ? new
                {
                    d.Parent.Id,
                    d.Parent.Title,
                    d.Parent.Slug
                } : null
            })
            .ToListAsync();

        return Ok(new { success = true, data = articles });
    }

    /// <summary>
    /// Get doc article preview (any status) - requires CMS_PREVIEW_SECRET
    /// </summary>
    [HttpGet("articles/preview-public/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetArticlePreview(string slug, [FromQuery] string secret)
    {
        _logger.LogInformation("Getting doc article preview for: {Slug}", slug);

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

        var article = await _context.DocItems
            .Where(d => d.Slug == slug && d.Type == DocItemType.File)
            .Select(d => new
            {
                d.Id,
                d.Title,
                d.Slug,
                d.Content,
                d.Icon,
                d.Order,
                d.ParentId,
                d.IsActive,
                d.CreatedAt,
                d.UpdatedAt,
                Category = d.Parent != null ? new
                {
                    d.Parent.Id,
                    d.Parent.Title,
                    d.Parent.Slug
                } : null,
                Author = d.Author != null ? new
                {
                    d.Author.Id,
                    Name = d.Author.FirstName + " " + d.Author.LastName,
                    Avatar = d.Author.ProfilePictureUrl
                } : null
            })
            .FirstOrDefaultAsync();

        if (article == null)
        {
            _logger.LogWarning("Doc article not found for preview: {Slug}", slug);
            return NotFound(new { success = false, message = "Article not found" });
        }

        return Ok(new { success = true, data = article });
    }
}
