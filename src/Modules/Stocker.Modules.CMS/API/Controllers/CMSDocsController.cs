using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Application.Features.Documentation.Commands;
using Stocker.Modules.CMS.Application.Features.Documentation.Queries;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/docs")]
public class CMSDocsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CMSDocsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Doc Categories

    [HttpGet("categories")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<DocCategoryDto>>> GetAllCategories(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocCategoriesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("categories/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocCategoryDto>>> GetActiveCategories(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveDocCategoriesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("categories/list")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocCategoryListDto>>> GetCategoryList(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocCategoryListQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<DocCategoryDto>> GetCategoryById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocCategoryByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet("categories/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<DocCategoryDto>> GetCategoryBySlug(string slug, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocCategoryBySlugQuery { Slug = slug }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("categories")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<DocCategoryDto>> CreateCategory([FromBody] CreateDocCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateDocCategoryCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetCategoryById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<DocCategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateDocCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateDocCategoryCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "DocCategory.NotFound") return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    [HttpDelete("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDocCategoryCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(result.Error);
        return NoContent();
    }

    #endregion

    #region Doc Articles

    [HttpGet("articles")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<DocArticleDto>>> GetAllArticles(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocArticlesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("articles/active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocArticleListDto>>> GetActiveArticles(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveDocArticlesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("articles/popular")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocArticleListDto>>> GetPopularArticles(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetPopularDocArticlesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("articles/category/{categoryId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocArticleListDto>>> GetArticlesByCategory(Guid categoryId, CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocArticlesByCategoryQuery { CategoryId = categoryId }, cancellationToken);
        return Ok(items);
    }

    [HttpGet("articles/search")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DocArticleListDto>>> SearchArticles([FromQuery] string q, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(new List<DocArticleListDto>());
        var items = await _mediator.Send(new SearchDocArticlesQuery { SearchTerm = q }, cancellationToken);
        return Ok(items);
    }

    [HttpGet("articles/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<DocArticleDto>> GetArticleById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocArticleByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet("articles/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<DocArticleDto>> GetArticleBySlug(string slug, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocArticleBySlugQuery { Slug = slug }, cancellationToken);
        if (item == null || !item.IsActive) return NotFound();

        // Increment view count
        await _mediator.Send(new IncrementDocArticleViewCommand { Id = item.Id }, cancellationToken);

        return Ok(item);
    }

    [HttpPost("articles")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<DocArticleDto>> CreateArticle([FromBody] CreateDocArticleDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateDocArticleCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetArticleById), new { id = result.Value.Id }, result.Value);
    }

    [HttpPut("articles/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<DocArticleDto>> UpdateArticle(Guid id, [FromBody] UpdateDocArticleDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateDocArticleCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "DocArticle.NotFound") return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    [HttpDelete("articles/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteArticle(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDocArticleCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(result.Error);
        return NoContent();
    }

    #endregion
}
