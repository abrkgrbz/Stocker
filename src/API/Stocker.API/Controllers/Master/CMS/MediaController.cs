using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Master;
using Stocker.Application.DTOs.CMS;
using Stocker.Application.Features.CMS.Media.Commands.UploadMedia;
using Stocker.Application.Features.CMS.Media.Commands.DeleteMedia;
using Stocker.Application.Features.CMS.Media.Queries.GetMediaList;
using Stocker.SharedKernel.Pagination;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master.CMS;

/// <summary>
/// Medya kütüphanesi yönetimi endpoint'leri
/// </summary>
[Route("api/v1/cms/[controller]")]
[SwaggerTag("CMS - Medya Kütüphanesi")]
public class MediaController : MasterControllerBase
{
    public MediaController(IMediator mediator, ILogger<MediaController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Medya dosyalarını listeler
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<CmsMediaListDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetMediaListQuery query)
    {
        _logger.LogInformation("Getting media list");
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Dosya yükler
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<MediaUploadResultDto>), 201)]
    [ProducesResponseType(400)]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string? altText, [FromForm] string? title, [FromForm] string? folder)
    {
        _logger.LogInformation("Uploading media file: {FileName}", file?.FileName);

        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiResponse<MediaUploadResultDto>
            {
                Success = false,
                Message = "Dosya zorunludur",
                Timestamp = DateTime.UtcNow
            });
        }

        var command = new UploadMediaCommand
        {
            File = file,
            AltText = altText,
            Title = title,
            Folder = folder
        };

        // Set uploader from current user
        if (Guid.TryParse(CurrentUserId, out var uploaderId))
        {
            command.UploadedById = uploaderId;
        }

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetAll), null,
                new ApiResponse<MediaUploadResultDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Dosya başarıyla yüklendi",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Medya dosyasını siler
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting media: {MediaId} by user: {UserEmail}", id, CurrentUserEmail);
        var command = new DeleteMediaCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}
