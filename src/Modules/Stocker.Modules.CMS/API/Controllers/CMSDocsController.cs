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
    public async Task<ActionResult<ApiResponse<IEnumerable<DocCategoryDto>>>> GetAllCategories(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocCategoriesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocCategoryDto>>.SuccessResponse(items));
    }

    [HttpGet("categories/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocCategoryDto>>>> GetActiveCategories(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveDocCategoriesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocCategoryDto>>.SuccessResponse(items));
    }

    [HttpGet("categories/list")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocCategoryListDto>>>> GetCategoryList(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocCategoryListQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocCategoryListDto>>.SuccessResponse(items));
    }

    [HttpGet("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<DocCategoryDto>>> GetCategoryById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocCategoryByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound(ApiResponse<DocCategoryDto>.FailureResponse("Category not found"));
        return Ok(ApiResponse<DocCategoryDto>.SuccessResponse(item));
    }

    [HttpGet("categories/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<DocCategoryDto>>> GetCategoryBySlug(string slug, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocCategoryBySlugQuery { Slug = slug }, cancellationToken);
        if (item == null) return NotFound(ApiResponse<DocCategoryDto>.FailureResponse("Category not found"));
        return Ok(ApiResponse<DocCategoryDto>.SuccessResponse(item));
    }

    [HttpPost("categories")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<DocCategoryDto>>> CreateCategory([FromBody] CreateDocCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateDocCategoryCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<DocCategoryDto>.FailureResponse(result.Error.Description));
        return CreatedAtAction(nameof(GetCategoryById), new { id = result.Value.Id }, ApiResponse<DocCategoryDto>.SuccessResponse(result.Value));
    }

    [HttpPut("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<DocCategoryDto>>> UpdateCategory(Guid id, [FromBody] UpdateDocCategoryDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateDocCategoryCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "DocCategory.NotFound") return NotFound(ApiResponse<DocCategoryDto>.FailureResponse(result.Error.Description));
            return BadRequest(ApiResponse<DocCategoryDto>.FailureResponse(result.Error.Description));
        }
        return Ok(ApiResponse<DocCategoryDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDocCategoryCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(ApiResponse<bool>.FailureResponse(result.Error.Description));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Doc Articles

    [HttpGet("articles")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocArticleDto>>>> GetAllArticles(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocArticlesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocArticleDto>>.SuccessResponse(items));
    }

    [HttpGet("articles/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocArticleListDto>>>> GetActiveArticles(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetActiveDocArticlesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocArticleListDto>>.SuccessResponse(items));
    }

    [HttpGet("articles/popular")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocArticleListDto>>>> GetPopularArticles(CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetPopularDocArticlesQuery(), cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocArticleListDto>>.SuccessResponse(items));
    }

    [HttpGet("articles/category/{categoryId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocArticleListDto>>>> GetArticlesByCategory(Guid categoryId, CancellationToken cancellationToken)
    {
        var items = await _mediator.Send(new GetDocArticlesByCategoryQuery { CategoryId = categoryId }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocArticleListDto>>.SuccessResponse(items));
    }

    [HttpGet("articles/search")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocArticleListDto>>>> SearchArticles([FromQuery] string q, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(ApiResponse<IEnumerable<DocArticleListDto>>.SuccessResponse(new List<DocArticleListDto>()));
        var items = await _mediator.Send(new SearchDocArticlesQuery { SearchTerm = q }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<DocArticleListDto>>.SuccessResponse(items));
    }

    [HttpGet("articles/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<DocArticleDto>>> GetArticleById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocArticleByIdQuery { Id = id }, cancellationToken);
        if (item == null) return NotFound(ApiResponse<DocArticleDto>.FailureResponse("Article not found"));
        return Ok(ApiResponse<DocArticleDto>.SuccessResponse(item));
    }

    [HttpGet("articles/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<DocArticleDto>>> GetArticleBySlug(string slug, CancellationToken cancellationToken)
    {
        var item = await _mediator.Send(new GetDocArticleBySlugQuery { Slug = slug }, cancellationToken);
        if (item == null || !item.IsActive) return NotFound(ApiResponse<DocArticleDto>.FailureResponse("Article not found"));

        // Increment view count
        await _mediator.Send(new IncrementDocArticleViewCommand { Id = item.Id }, cancellationToken);

        return Ok(ApiResponse<DocArticleDto>.SuccessResponse(item));
    }

    [HttpPost("articles")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<DocArticleDto>>> CreateArticle([FromBody] CreateDocArticleDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateDocArticleCommand { Data = dto }, cancellationToken);
        if (result.IsFailure) return BadRequest(ApiResponse<DocArticleDto>.FailureResponse(result.Error.Description));
        return CreatedAtAction(nameof(GetArticleById), new { id = result.Value.Id }, ApiResponse<DocArticleDto>.SuccessResponse(result.Value));
    }

    [HttpPut("articles/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<DocArticleDto>>> UpdateArticle(Guid id, [FromBody] UpdateDocArticleDto dto, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateDocArticleCommand { Id = id, Data = dto }, cancellationToken);
        if (result.IsFailure)
        {
            if (result.Error.Code == "DocArticle.NotFound") return NotFound(ApiResponse<DocArticleDto>.FailureResponse(result.Error.Description));
            return BadRequest(ApiResponse<DocArticleDto>.FailureResponse(result.Error.Description));
        }
        return Ok(ApiResponse<DocArticleDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("articles/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteArticle(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDocArticleCommand { Id = id }, cancellationToken);
        if (result.IsFailure) return NotFound(ApiResponse<bool>.FailureResponse(result.Error.Description));
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion
}
