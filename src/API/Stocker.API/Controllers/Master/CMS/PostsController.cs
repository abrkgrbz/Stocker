using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Master;
using Stocker.Application.DTOs.CMS;
using Stocker.Application.Features.CMS.Posts.Commands.CreatePost;
using Stocker.Application.Features.CMS.Posts.Commands.UpdatePost;
using Stocker.Application.Features.CMS.Posts.Commands.DeletePost;
using Stocker.Application.Features.CMS.Posts.Queries.GetPostById;
using Stocker.Application.Features.CMS.Posts.Queries.GetPostsList;
using Stocker.Application.Features.CMS.Categories.Commands.CreateCategory;
using Stocker.Application.Features.CMS.Categories.Queries.GetCategoriesList;
using Stocker.SharedKernel.Pagination;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master.CMS;

/// <summary>
/// Blog yazısı yönetimi endpoint'leri
/// </summary>
[Route("api/v1/cms/[controller]")]
[SwaggerTag("CMS - Blog Yazıları")]
public class PostsController : MasterControllerBase
{
    public PostsController(IMediator mediator, ILogger<PostsController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Blog yazılarını listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<BlogPostListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetPostsListQuery query)
    {
        _logger.LogInformation("Getting blog posts list");
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Blog yazısı detayını getirir
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BlogPostDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting blog post: {PostId}", id);
        var query = new GetPostByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Yeni blog yazısı oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BlogPostDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreatePostCommand command)
    {
        _logger.LogInformation("Creating blog post: {Title}", command.Title);

        // Set author from current user
        if (Guid.TryParse(CurrentUserId, out var authorId))
        {
            command.AuthorId = authorId;
        }

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id },
                new ApiResponse<BlogPostDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Blog yazısı başarıyla oluşturuldu",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Blog yazısını günceller
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BlogPostDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePostCommand command)
    {
        _logger.LogInformation("Updating blog post: {PostId}", id);
        command.Id = id;
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Blog yazısını siler
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting blog post: {PostId} by user: {UserEmail}", id, CurrentUserEmail);
        var command = new DeletePostCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}

/// <summary>
/// Blog kategorileri yönetimi endpoint'leri
/// </summary>
[Route("api/v1/cms/[controller]")]
[SwaggerTag("CMS - Blog Kategorileri")]
public class CategoriesController : MasterControllerBase
{
    public CategoriesController(IMediator mediator, ILogger<CategoriesController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Kategorileri listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<BlogCategoryListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetCategoriesListQuery query)
    {
        _logger.LogInformation("Getting blog categories list");
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Yeni kategori oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BlogCategoryDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
    {
        _logger.LogInformation("Creating blog category: {Name}", command.Name);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetAll), null,
                new ApiResponse<BlogCategoryDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Kategori başarıyla oluşturuldu",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }
}
