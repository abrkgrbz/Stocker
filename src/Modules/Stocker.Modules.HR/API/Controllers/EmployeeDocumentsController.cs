using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Features.Documents.Commands;
using Stocker.Modules.HR.Application.Features.Documents.Queries;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/documents")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class EmployeeDocumentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeeDocumentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all employee documents with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeDocumentDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<EmployeeDocumentDto>>> GetDocuments(
        [FromQuery] int? employeeId = null,
        [FromQuery] DocumentType? documentType = null,
        [FromQuery] bool? isVerified = null,
        [FromQuery] bool? isExpired = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = new GetEmployeeDocumentsQuery
        {
            EmployeeId = employeeId,
            DocumentType = documentType,
            IsVerified = isVerified,
            IsExpired = isExpired,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get documents for a specific employee
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    [ProducesResponseType(typeof(List<EmployeeDocumentDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<EmployeeDocumentDto>>> GetEmployeeDocuments(
        int employeeId,
        [FromQuery] DocumentType? documentType = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = new GetEmployeeDocumentsQuery
        {
            EmployeeId = employeeId,
            DocumentType = documentType,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query);
        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    /// <summary>
    /// Get document by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeDocumentDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EmployeeDocumentDto>> GetDocument(int id)
    {
        var query = new GetEmployeeDocumentByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new employee document
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EmployeeDocumentDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<EmployeeDocumentDto>> CreateDocument(CreateEmployeeDocumentDto dto)
    {
        var command = new CreateEmployeeDocumentCommand { DocumentData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetDocument), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Update an existing document
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(EmployeeDocumentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EmployeeDocumentDto>> UpdateDocument(int id, UpdateEmployeeDocumentDto dto)
    {
        var command = new UpdateEmployeeDocumentCommand { DocumentId = id, DocumentData = dto };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var command = new DeleteEmployeeDocumentCommand { DocumentId = id };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return NoContent();
    }

    /// <summary>
    /// Verify a document
    /// </summary>
    [HttpPost("{id}/verify")]
    [ProducesResponseType(typeof(EmployeeDocumentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EmployeeDocumentDto>> VerifyDocument(int id, VerifyDocumentDto dto)
    {
        var command = new VerifyEmployeeDocumentCommand
        {
            DocumentId = id,
            VerificationData = dto
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }

    /// <summary>
    /// Upload a file for an existing document
    /// </summary>
    [HttpPost("{id}/upload")]
    [ProducesResponseType(typeof(EmployeeDocumentDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<EmployeeDocumentDto>> UploadDocument(int id, UploadDocumentFileDto dto)
    {
        var command = new UploadEmployeeDocumentCommand
        {
            DocumentId = id,
            FileName = dto.FileName,
            FileUrl = dto.FileUrl,
            FileType = dto.FileType,
            FileSizeBytes = dto.FileSizeBytes
        };
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound) return NotFound(result.Error);
            return BadRequest(result.Error);
        }
        return Ok(result.Value);
    }
}

public class UploadDocumentFileDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long? FileSizeBytes { get; set; }
}
