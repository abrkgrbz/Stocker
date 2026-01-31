using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Master;
using Stocker.Application.DTOs.CMS;
using Stocker.Application.Features.CMS.Pages.Commands.CreatePage;
using Stocker.Application.Features.CMS.Pages.Commands.UpdatePage;
using Stocker.Application.Features.CMS.Pages.Commands.DeletePage;
using Stocker.Application.Features.CMS.Pages.Commands.CheckSlug;
using Stocker.Application.Features.CMS.Pages.Queries.GetPageById;
using Stocker.Application.Features.CMS.Pages.Queries.GetPagesList;
using Stocker.SharedKernel.Pagination;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master.CMS;

/// <summary>
/// CMS sayfa yönetimi endpoint'leri
/// </summary>
[Route("api/v1/cms/[controller]")]
[SwaggerTag("CMS - Sayfa Yönetimi")]
public class PagesController : MasterControllerBase
{
    public PagesController(IMediator mediator, ILogger<PagesController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Sayfaları listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<CmsPageListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetPagesListQuery query)
    {
        _logger.LogInformation("Getting CMS pages list");
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Sayfa detayını getirir
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CmsPageDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting CMS page: {PageId}", id);
        var query = new GetPageByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Yeni sayfa oluşturur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CmsPageDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreatePageCommand command)
    {
        _logger.LogInformation("Creating CMS page: {Title}", command.Title);

        // Set author from current user
        if (Guid.TryParse(CurrentUserId, out var authorId))
        {
            command.AuthorId = authorId;
        }

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id },
                new ApiResponse<CmsPageDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Sayfa başarıyla oluşturuldu",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Sayfayı günceller
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CmsPageDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePageCommand command)
    {
        _logger.LogInformation("Updating CMS page: {PageId}", id);
        command.Id = id;
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sayfayı siler
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting CMS page: {PageId} by user: {UserEmail}", id, CurrentUserEmail);
        var command = new DeletePageCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Slug benzersizliğini kontrol eder
    /// </summary>
    [HttpPost("check-slug")]
    [ProducesResponseType(typeof(ApiResponse<SlugCheckResultDto>), 200)]
    public async Task<IActionResult> CheckSlug([FromBody] CheckPageSlugCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}
