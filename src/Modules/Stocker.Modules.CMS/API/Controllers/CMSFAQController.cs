using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/faq")]
public class CMSFAQController : ControllerBase
{
    private readonly IFAQRepository _repository;
    private readonly IMapper _mapper;

    public CMSFAQController(IFAQRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    #region Categories

    /// <summary>
    /// Get all FAQ categories (admin)
    /// </summary>
    [HttpGet("categories")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<FAQCategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _repository.GetAllCategoriesAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<FAQCategoryDto>>.SuccessResponse(_mapper.Map<IEnumerable<FAQCategoryDto>>(categories)));
    }

    /// <summary>
    /// Get active FAQ categories with items (public)
    /// </summary>
    [HttpGet("categories/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<FAQCategoryDto>>>> GetActiveCategories(CancellationToken cancellationToken)
    {
        var categories = await _repository.GetActiveCategoriesAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<FAQCategoryDto>>.SuccessResponse(_mapper.Map<IEnumerable<FAQCategoryDto>>(categories)));
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    [HttpGet("categories/{id:guid}")]
    public async Task<ActionResult<ApiResponse<FAQCategoryDto>>> GetCategoryById(Guid id, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryByIdAsync(id, cancellationToken);
        if (category == null)
            return NotFound(ApiResponse<FAQCategoryDto>.FailureResponse("Category not found"));

        return Ok(ApiResponse<FAQCategoryDto>.SuccessResponse(_mapper.Map<FAQCategoryDto>(category)));
    }

    /// <summary>
    /// Get category by slug (public)
    /// </summary>
    [HttpGet("categories/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<FAQCategoryDto>>> GetCategoryBySlug(string slug, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryBySlugAsync(slug, cancellationToken);
        if (category == null || !category.IsActive)
            return NotFound(ApiResponse<FAQCategoryDto>.FailureResponse("Category not found"));

        return Ok(ApiResponse<FAQCategoryDto>.SuccessResponse(_mapper.Map<FAQCategoryDto>(category)));
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost("categories")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FAQCategoryDto>>> CreateCategory([FromBody] CreateFAQCategoryDto dto, CancellationToken cancellationToken)
    {
        var category = _mapper.Map<FAQCategory>(dto);
        var created = await _repository.AddCategoryAsync(category, cancellationToken);
        return CreatedAtAction(nameof(GetCategoryById), new { id = created.Id }, ApiResponse<FAQCategoryDto>.SuccessResponse(_mapper.Map<FAQCategoryDto>(created)));
    }

    /// <summary>
    /// Update a category
    /// </summary>
    [HttpPut("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FAQCategoryDto>>> UpdateCategory(Guid id, [FromBody] UpdateFAQCategoryDto dto, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryByIdAsync(id, cancellationToken);
        if (category == null)
            return NotFound(ApiResponse<FAQCategoryDto>.FailureResponse("Category not found"));

        _mapper.Map(dto, category);
        await _repository.UpdateCategoryAsync(category, cancellationToken);
        return Ok(ApiResponse<FAQCategoryDto>.SuccessResponse(_mapper.Map<FAQCategoryDto>(category)));
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("categories/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        await _repository.DeleteCategoryAsync(id, cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion

    #region Items

    /// <summary>
    /// Get all FAQ items (admin)
    /// </summary>
    [HttpGet("items")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<FAQItemDto>>>> GetAllItems(CancellationToken cancellationToken)
    {
        var items = await _repository.GetAllItemsAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<FAQItemDto>>.SuccessResponse(_mapper.Map<IEnumerable<FAQItemDto>>(items)));
    }

    /// <summary>
    /// Get active FAQ items (public)
    /// </summary>
    [HttpGet("items/active")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<FAQItemDto>>>> GetActiveItems(CancellationToken cancellationToken)
    {
        var items = await _repository.GetActiveItemsAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<FAQItemDto>>.SuccessResponse(_mapper.Map<IEnumerable<FAQItemDto>>(items)));
    }

    /// <summary>
    /// Get item by ID
    /// </summary>
    [HttpGet("items/{id:guid}")]
    public async Task<ActionResult<ApiResponse<FAQItemDto>>> GetItemById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _repository.GetItemByIdAsync(id, cancellationToken);
        if (item == null)
            return NotFound(ApiResponse<FAQItemDto>.FailureResponse("FAQ item not found"));

        // Increment view count
        await _repository.IncrementViewCountAsync(id, cancellationToken);

        return Ok(ApiResponse<FAQItemDto>.SuccessResponse(_mapper.Map<FAQItemDto>(item)));
    }

    /// <summary>
    /// Create a new item
    /// </summary>
    [HttpPost("items")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FAQItemDto>>> CreateItem([FromBody] CreateFAQItemDto dto, CancellationToken cancellationToken)
    {
        var item = _mapper.Map<FAQItem>(dto);
        var created = await _repository.AddItemAsync(item, cancellationToken);
        return CreatedAtAction(nameof(GetItemById), new { id = created.Id }, ApiResponse<FAQItemDto>.SuccessResponse(_mapper.Map<FAQItemDto>(created)));
    }

    /// <summary>
    /// Update an item
    /// </summary>
    [HttpPut("items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<FAQItemDto>>> UpdateItem(Guid id, [FromBody] UpdateFAQItemDto dto, CancellationToken cancellationToken)
    {
        var item = await _repository.GetItemByIdAsync(id, cancellationToken);
        if (item == null)
            return NotFound(ApiResponse<FAQItemDto>.FailureResponse("FAQ item not found"));

        _mapper.Map(dto, item);
        await _repository.UpdateItemAsync(item, cancellationToken);
        return Ok(ApiResponse<FAQItemDto>.SuccessResponse(_mapper.Map<FAQItemDto>(item)));
    }

    /// <summary>
    /// Delete an item
    /// </summary>
    [HttpDelete("items/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteItem(Guid id, CancellationToken cancellationToken)
    {
        await _repository.DeleteItemAsync(id, cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    /// <summary>
    /// Mark FAQ as helpful/not helpful (public)
    /// </summary>
    [HttpPost("items/{id:guid}/feedback")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> SubmitFeedback(Guid id, [FromQuery] bool helpful, CancellationToken cancellationToken)
    {
        await _repository.IncrementHelpfulCountAsync(id, helpful, cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }

    #endregion
}
