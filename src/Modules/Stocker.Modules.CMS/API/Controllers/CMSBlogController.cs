using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Enums;
using Stocker.Modules.CMS.Domain.Repositories;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/blog")]
public class CMSBlogController : ControllerBase
{
    private readonly IBlogRepository _repository;
    private readonly IMapper _mapper;

    public CMSBlogController(IBlogRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    #region Categories

    /// <summary>
    /// Get all blog categories
    /// </summary>
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BlogCategoryListDto>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _repository.GetAllCategoriesAsync(cancellationToken);
        return Ok(_mapper.Map<IEnumerable<BlogCategoryListDto>>(categories));
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    [HttpGet("categories/{id:guid}")]
    public async Task<ActionResult<BlogCategoryDto>> GetCategoryById(Guid id, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryByIdAsync(id, cancellationToken);
        if (category == null)
            return NotFound();

        return Ok(_mapper.Map<BlogCategoryDto>(category));
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost("categories")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<BlogCategoryDto>> CreateCategory([FromBody] CreateBlogCategoryDto dto, CancellationToken cancellationToken)
    {
        var category = _mapper.Map<BlogCategory>(dto);
        var created = await _repository.AddCategoryAsync(category, cancellationToken);
        return CreatedAtAction(nameof(GetCategoryById), new { id = created.Id }, _mapper.Map<BlogCategoryDto>(created));
    }

    /// <summary>
    /// Update a category
    /// </summary>
    [HttpPut("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<BlogCategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateBlogCategoryDto dto, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryByIdAsync(id, cancellationToken);
        if (category == null)
            return NotFound();

        _mapper.Map(dto, category);
        await _repository.UpdateCategoryAsync(category, cancellationToken);
        return Ok(_mapper.Map<BlogCategoryDto>(category));
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        await _repository.DeleteCategoryAsync(id, cancellationToken);
        return NoContent();
    }

    #endregion

    #region Posts

    /// <summary>
    /// Get all posts (admin)
    /// </summary>
    [HttpGet("posts")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<BlogPostListDto>>> GetAllPosts(CancellationToken cancellationToken)
    {
        var posts = await _repository.GetAllPostsAsync(cancellationToken);
        return Ok(_mapper.Map<IEnumerable<BlogPostListDto>>(posts));
    }

    /// <summary>
    /// Get published posts (public)
    /// </summary>
    [HttpGet("posts/published")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BlogPostListDto>>> GetPublishedPosts(CancellationToken cancellationToken)
    {
        var posts = await _repository.GetPublishedPostsAsync(cancellationToken);
        return Ok(_mapper.Map<IEnumerable<BlogPostListDto>>(posts));
    }

    /// <summary>
    /// Get post by ID
    /// </summary>
    [HttpGet("posts/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<BlogPostDto>> GetPostById(Guid id, CancellationToken cancellationToken)
    {
        var post = await _repository.GetPostByIdAsync(id, cancellationToken);
        if (post == null)
            return NotFound();

        return Ok(_mapper.Map<BlogPostDto>(post));
    }

    /// <summary>
    /// Get post by slug (public)
    /// </summary>
    [HttpGet("posts/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<BlogPostDto>> GetPostBySlug(string slug, CancellationToken cancellationToken)
    {
        var post = await _repository.GetPostBySlugAsync(slug, cancellationToken);
        if (post == null || post.Status != BlogPostStatus.Published)
            return NotFound();

        // Increment view count
        await _repository.IncrementViewCountAsync(post.Id, cancellationToken);

        return Ok(_mapper.Map<BlogPostDto>(post));
    }

    /// <summary>
    /// Get posts by category
    /// </summary>
    [HttpGet("categories/{categoryId:guid}/posts")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BlogPostListDto>>> GetPostsByCategory(Guid categoryId, CancellationToken cancellationToken)
    {
        var posts = await _repository.GetPostsByCategoryAsync(categoryId, cancellationToken);
        var publishedPosts = posts.Where(p => p.Status == BlogPostStatus.Published);
        return Ok(_mapper.Map<IEnumerable<BlogPostListDto>>(publishedPosts));
    }

    /// <summary>
    /// Create a new post
    /// </summary>
    [HttpPost("posts")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<BlogPostDto>> CreatePost([FromBody] CreateBlogPostDto dto, CancellationToken cancellationToken)
    {
        var post = _mapper.Map<BlogPost>(dto);

        if (dto.Status == BlogPostStatus.Published)
            post.PublishedAt = DateTime.UtcNow;

        var created = await _repository.AddPostAsync(post, cancellationToken);
        return CreatedAtAction(nameof(GetPostById), new { id = created.Id }, _mapper.Map<BlogPostDto>(created));
    }

    /// <summary>
    /// Update a post
    /// </summary>
    [HttpPut("posts/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<BlogPostDto>> UpdatePost(Guid id, [FromBody] UpdateBlogPostDto dto, CancellationToken cancellationToken)
    {
        var post = await _repository.GetPostByIdAsync(id, cancellationToken);
        if (post == null)
            return NotFound();

        var wasPublished = post.Status == BlogPostStatus.Published;
        _mapper.Map(dto, post);

        if (!wasPublished && dto.Status == BlogPostStatus.Published)
            post.PublishedAt = DateTime.UtcNow;

        await _repository.UpdatePostAsync(post, cancellationToken);
        return Ok(_mapper.Map<BlogPostDto>(post));
    }

    /// <summary>
    /// Delete a post
    /// </summary>
    [HttpDelete("posts/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken cancellationToken)
    {
        await _repository.DeletePostAsync(id, cancellationToken);
        return NoContent();
    }

    #endregion
}
