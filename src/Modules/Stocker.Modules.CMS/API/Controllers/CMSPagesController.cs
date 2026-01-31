using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Enums;
using Stocker.Modules.CMS.Domain.Repositories;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/pages")]
public class CMSPagesController : ControllerBase
{
    private readonly ICMSPageRepository _repository;
    private readonly IMapper _mapper;

    public CMSPagesController(ICMSPageRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    /// <summary>
    /// Get all pages (admin)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PageDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var pages = await _repository.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<PageDto>>.SuccessResponse(_mapper.Map<IEnumerable<PageDto>>(pages)));
    }

    /// <summary>
    /// Get published pages (public)
    /// </summary>
    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<PageDto>>>> GetPublished(CancellationToken cancellationToken)
    {
        var pages = await _repository.GetPublishedAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<PageDto>>.SuccessResponse(_mapper.Map<IEnumerable<PageDto>>(pages)));
    }

    /// <summary>
    /// Get page by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PageDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var page = await _repository.GetByIdAsync(id, cancellationToken);
        if (page == null)
            return NotFound(ApiResponse<PageDto>.FailureResponse("Page not found"));

        return Ok(ApiResponse<PageDto>.SuccessResponse(_mapper.Map<PageDto>(page)));
    }

    /// <summary>
    /// Get page by slug (public - only published)
    /// </summary>
    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PageDto>>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var page = await _repository.GetBySlugAsync(slug, cancellationToken);
        if (page == null || page.Status != PageStatus.Published)
            return NotFound(ApiResponse<PageDto>.FailureResponse("Page not found"));

        return Ok(ApiResponse<PageDto>.SuccessResponse(_mapper.Map<PageDto>(page)));
    }

    /// <summary>
    /// Preview page by slug (admin only - any status)
    /// </summary>
    [HttpGet("preview/{slug}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PageDto>>> PreviewBySlug(string slug, CancellationToken cancellationToken)
    {
        var page = await _repository.GetBySlugAsync(slug, cancellationToken);
        if (page == null)
            return NotFound(ApiResponse<PageDto>.FailureResponse("Page not found"));

        return Ok(ApiResponse<PageDto>.SuccessResponse(_mapper.Map<PageDto>(page)));
    }

    /// <summary>
    /// Create a new page
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PageDto>>> Create([FromBody] CreatePageDto dto, CancellationToken cancellationToken)
    {
        var page = _mapper.Map<CMSPage>(dto);

        if (dto.Status == PageStatus.Published)
            page.PublishedAt = DateTime.UtcNow;

        var created = await _repository.AddAsync(page, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<PageDto>.SuccessResponse(_mapper.Map<PageDto>(created)));
    }

    /// <summary>
    /// Update a page
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<PageDto>>> Update(Guid id, [FromBody] UpdatePageDto dto, CancellationToken cancellationToken)
    {
        var page = await _repository.GetByIdAsync(id, cancellationToken);
        if (page == null)
            return NotFound(ApiResponse<PageDto>.FailureResponse("Page not found"));

        var wasPublished = page.Status == PageStatus.Published;
        _mapper.Map(dto, page);

        if (!wasPublished && dto.Status == PageStatus.Published)
            page.PublishedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(page, cancellationToken);
        return Ok(ApiResponse<PageDto>.SuccessResponse(_mapper.Map<PageDto>(page)));
    }

    /// <summary>
    /// Delete a page
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _repository.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponse<bool>.SuccessResponse(true));
    }
}
