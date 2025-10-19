using Stocker.SharedKernel.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.Modules.CRM.Application.Features.Documents.Commands.DeleteDocument;
using Stocker.Modules.CRM.Application.Features.Documents.Commands.UpdateDocument;
using Stocker.Modules.CRM.Application.Features.Documents.Commands.UploadDocument;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.Modules.Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentsByEntity;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/documents")]
[RequireModule("CRM")]
public class DocumentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDocumentStorageService _storageService;

    public DocumentsController(IMediator mediator, IDocumentStorageService storageService)
    {
        _mediator = mediator;
        _storageService = storageService;
    }

    /// <summary>
    /// Upload a new document
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(UploadDocumentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest(new { Error = "File is required" });

        using var memoryStream = new MemoryStream();
        await request.File.CopyToAsync(memoryStream);
        var fileData = memoryStream.ToArray();

        var command = new UploadDocumentCommand(
            request.File.FileName,
            request.File.ContentType,
            request.File.Length,
            fileData,
            request.EntityId,
            request.EntityType,
            request.Category,
            request.Description,
            request.Tags,
            request.AccessLevel,
            request.ExpiresAt
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { Error = result.Error });

        return CreatedAtAction(nameof(GetDocumentById), new { id = result.Value.DocumentId }, result.Value);
    }

    /// <summary>
    /// Get document by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DocumentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentById(int id)
    {
        var query = new GetDocumentByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { Error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Get documents by entity
    /// </summary>
    [HttpGet("entity/{entityId}/{entityType}")]
    [ProducesResponseType(typeof(List<DocumentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentsByEntity(int entityId, string entityType)
    {
        var query = new GetDocumentsByEntityQuery(entityId, entityType);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { Error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Download document file
    /// </summary>
    [HttpGet("{id}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        var query = new GetDocumentByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { Error = result.Error });

        var document = result.Value;

        var fileResult = await _storageService.DownloadFileAsync(document.StoragePath);
        if (!fileResult.IsSuccess)
            return NotFound(new { Error = fileResult.Error });

        return File(fileResult.Value, document.ContentType, document.OriginalFileName);
    }

    /// <summary>
    /// Get temporary download URL
    /// </summary>
    [HttpGet("{id}/url")]
    [ProducesResponseType(typeof(DownloadUrlResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDownloadUrl(int id, [FromQuery] int expiresInMinutes = 60)
    {
        var query = new GetDocumentByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { Error = result.Error });

        var document = result.Value;

        var urlResult = await _storageService.GetDownloadUrlAsync(
            document.StoragePath,
            TimeSpan.FromMinutes(expiresInMinutes));

        if (!urlResult.IsSuccess)
            return BadRequest(new { Error = urlResult.Error });

        return Ok(new DownloadUrlResponse(urlResult.Value, DateTime.UtcNow.AddMinutes(expiresInMinutes)));
    }

    /// <summary>
    /// Update document metadata
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
    {
        var command = new UpdateDocumentCommand(
            id,
            request.Description,
            request.Tags,
            request.Category,
            request.AccessLevel
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { Error = result.Error });

        return NoContent();
    }

    /// <summary>
    /// Delete document
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var command = new DeleteDocumentCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return NotFound(new { Error = result.Error });

        return NoContent();
    }
}

// Request DTOs
public record UploadDocumentRequest(
    IFormFile File,
    int EntityId,
    string EntityType,
    Domain.Enums.DocumentCategory Category,
    string? Description = null,
    string? Tags = null,
    Domain.Enums.AccessLevel AccessLevel = Domain.Enums.AccessLevel.Private,
    DateTime? ExpiresAt = null
);

public record UpdateDocumentRequest(
    string? Description = null,
    string? Tags = null,
    Domain.Enums.DocumentCategory? Category = null,
    Domain.Enums.AccessLevel? AccessLevel = null
);

public record DownloadUrlResponse(string Url, DateTime ExpiresAt);
