using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Master;
using Stocker.Application.DTOs.CMS;
using Stocker.Application.Features.CMS.Docs.Commands.CreateDocItem;
using Stocker.Application.Features.CMS.Docs.Commands.UpdateDocItem;
using Stocker.Application.Features.CMS.Docs.Commands.DeleteDocItem;
using Stocker.Application.Features.CMS.Docs.Queries.GetDocTree;
using Stocker.Application.Features.CMS.Docs.Queries.GetDocById;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master.CMS;

/// <summary>
/// Dokümantasyon yönetimi endpoint'leri
/// </summary>
[Route("api/v1/cms/[controller]")]
[SwaggerTag("CMS - Dokümantasyon")]
public class DocsController : MasterControllerBase
{
    public DocsController(IMediator mediator, ILogger<DocsController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Doküman ağacını getirir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<DocItemTreeDto>>), 200)]
    public async Task<IActionResult> GetTree([FromQuery] GetDocTreeQuery query)
    {
        _logger.LogInformation("Getting documentation tree");
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Doküman detayını getirir
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DocItemDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting doc item: {DocItemId}", id);
        var query = new GetDocByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Yeni doküman oluşturur (klasör veya dosya)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DocItemDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateDocItemCommand command)
    {
        _logger.LogInformation("Creating doc item: {Title} ({Type})", command.Title, command.Type);

        // Set author from current user
        if (Guid.TryParse(CurrentUserId, out var authorId))
        {
            command.AuthorId = authorId;
        }

        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id },
                new ApiResponse<DocItemDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Doküman başarıyla oluşturuldu",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Dokümanı günceller
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DocItemDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDocItemCommand command)
    {
        _logger.LogInformation("Updating doc item: {DocItemId}", id);
        command.Id = id;
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Dokümanı siler (klasör ise alt öğeleriyle birlikte)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting doc item: {DocItemId} by user: {UserEmail}", id, CurrentUserEmail);
        var command = new DeleteDocItemCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}
