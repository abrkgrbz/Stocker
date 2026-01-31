using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums.CMS;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public.CMS;

/// <summary>
/// Public CMS Blog API - No authentication required
/// Used by the public frontend to display blog posts
/// </summary>
[ApiController]
[Route("api/cms/blog")]
[AllowAnonymous]
[SwaggerTag("Public CMS - Blog for public website")]
public class PublicCmsBlogController : ControllerBase
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<PublicCmsBlogController> _logger;

    public PublicCmsBlogController(
        IMasterDbContext context,
        ILogger<PublicCmsBlogController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all blog categories
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetCategories()
    {
        _logger.LogInformation("Getting blog categories");

        var categories = await _context.BlogCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.Color,
                PostCount = c.Posts.Count(p => p.Status == PostStatus.Published)
            })
            .ToListAsync();

        return Ok(new { success = true, data = categories });
    }

    /// <summary>
    /// Get all published blog posts
    /// </summary>
    [HttpGet("posts/published")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetPublishedPosts([FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        _logger.LogInformation("Getting published blog posts, page: {Page}, limit: {Limit}", page, limit);

        var query = _context.BlogPosts
            .Where(p => p.Status == PostStatus.Published)
            .OrderByDescending(p => p.PublishDate);

        var total = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Excerpt,
                p.FeaturedImage,
                p.PublishDate,
                p.Views,
                p.MetaTitle,
                p.MetaDescription,
                Tags = p.Tags,
                Category = p.Category != null ? new
                {
                    p.Category.Id,
                    p.Category.Name,
                    p.Category.Slug,
                    p.Category.Color
                } : null,
                Author = p.Author != null ? new
                {
                    p.Author.Id,
                    Name = p.Author.FirstName + " " + p.Author.LastName,
                    Avatar = p.Author.ProfilePictureUrl
                } : null
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = posts,
            pagination = new
            {
                page,
                limit,
                total,
                totalPages = (int)Math.Ceiling((double)total / limit)
            }
        });
    }

    /// <summary>
    /// Get a blog post by slug
    /// </summary>
    [HttpGet("posts/slug/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPostBySlug(string slug)
    {
        _logger.LogInformation("Getting blog post by slug: {Slug}", slug);

        var post = await _context.BlogPosts
            .Where(p => p.Slug == slug && p.Status == PostStatus.Published)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Content,
                p.Excerpt,
                p.FeaturedImage,
                p.PublishDate,
                p.Views,
                p.MetaTitle,
                p.MetaDescription,
                Tags = p.Tags,
                p.CreatedAt,
                p.UpdatedAt,
                Category = p.Category != null ? new
                {
                    p.Category.Id,
                    p.Category.Name,
                    p.Category.Slug,
                    p.Category.Color
                } : null,
                Author = p.Author != null ? new
                {
                    p.Author.Id,
                    Name = p.Author.FirstName + " " + p.Author.LastName,
                    Avatar = p.Author.ProfilePictureUrl
                } : null
            })
            .FirstOrDefaultAsync();

        if (post == null)
        {
            _logger.LogWarning("Blog post not found: {Slug}", slug);
            return NotFound(new { success = false, message = "Post not found" });
        }

        // Increment views (fire and forget)
        _ = IncrementViewsAsync(slug);

        return Ok(new { success = true, data = post });
    }

    /// <summary>
    /// Get posts by category
    /// </summary>
    [HttpGet("categories/{categoryId}/posts")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetPostsByCategory(Guid categoryId, [FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        _logger.LogInformation("Getting blog posts for category: {CategoryId}", categoryId);

        var query = _context.BlogPosts
            .Where(p => p.CategoryId == categoryId && p.Status == PostStatus.Published)
            .OrderByDescending(p => p.PublishDate);

        var total = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Excerpt,
                p.FeaturedImage,
                p.PublishDate,
                p.Views,
                Tags = p.Tags,
                Author = p.Author != null ? new
                {
                    p.Author.Id,
                    Name = p.Author.FirstName + " " + p.Author.LastName,
                    Avatar = p.Author.ProfilePictureUrl
                } : null
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = posts,
            pagination = new
            {
                page,
                limit,
                total,
                totalPages = (int)Math.Ceiling((double)total / limit)
            }
        });
    }

    /// <summary>
    /// Get blog post preview (any status) - requires CMS_PREVIEW_SECRET
    /// </summary>
    [HttpGet("posts/preview-public/{slug}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPostPreview(string slug, [FromQuery] string secret)
    {
        _logger.LogInformation("Getting blog post preview for: {Slug}", slug);

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

        var post = await _context.BlogPosts
            .Where(p => p.Slug == slug)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Content,
                p.Excerpt,
                p.FeaturedImage,
                p.PublishDate,
                p.Views,
                p.MetaTitle,
                p.MetaDescription,
                Tags = p.Tags,
                Status = p.Status.ToString(),
                p.CreatedAt,
                p.UpdatedAt,
                Category = p.Category != null ? new
                {
                    p.Category.Id,
                    p.Category.Name,
                    p.Category.Slug,
                    p.Category.Color
                } : null,
                Author = p.Author != null ? new
                {
                    p.Author.Id,
                    Name = p.Author.FirstName + " " + p.Author.LastName,
                    Avatar = p.Author.ProfilePictureUrl
                } : null
            })
            .FirstOrDefaultAsync();

        if (post == null)
        {
            _logger.LogWarning("Blog post not found for preview: {Slug}", slug);
            return NotFound(new { success = false, message = "Post not found" });
        }

        return Ok(new { success = true, data = post });
    }

    private async Task IncrementViewsAsync(string slug)
    {
        try
        {
            var post = await _context.BlogPosts.FirstOrDefaultAsync(p => p.Slug == slug);
            if (post != null)
            {
                post.IncrementViews();
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to increment views for post: {Slug}", slug);
        }
    }
}
