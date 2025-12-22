using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;
using Stocker.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;
using Stocker.Application.Features.EmailTemplates.Commands.ToggleEmailTemplateStatus;
using Stocker.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;
using Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplateById;
using Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplateCategories;
using Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplatesList;
using Stocker.Application.Features.EmailTemplates.Queries.PreviewEmailTemplate;
using Stocker.Application.Features.EmailTemplates.Queries.ValidateEmailTemplate;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Manages email templates for the system
/// </summary>
[SwaggerTag("Master Admin Panel - Email Template Management")]
public class EmailTemplatesController : MasterControllerBase
{
    public EmailTemplatesController(IMediator mediator, ILogger<EmailTemplatesController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get all email templates with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplateListDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] GetEmailTemplatesListQuery query)
    {
        _logger.LogInformation("Getting email templates with filters: Category={Category}, Language={Language}",
            query.Category, query.Language);

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get email template by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplateDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting email template by ID: {TemplateId}", id);

        var query = new GetEmailTemplateByIdQuery(id);
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get all available template categories
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(ApiResponse<List<string>>), 200)]
    public async Task<IActionResult> GetCategories()
    {
        var query = new GetEmailTemplateCategoriesQuery();
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new email template
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplateDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateEmailTemplateCommand command)
    {
        _logger.LogInformation("Creating new email template: {TemplateKey}", command.TemplateKey);

        command.CreatedBy = CurrentUserEmail;
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Email template created with ID: {TemplateId}", result.Value.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Value.Id },
                new ApiResponse<EmailTemplateDto>
                {
                    Success = true,
                    Data = result.Value,
                    Message = "Email template created successfully",
                    Timestamp = DateTime.UtcNow
                });
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Update an existing email template
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplateDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEmailTemplateCommand command)
    {
        _logger.LogInformation("Updating email template ID: {TemplateId}", id);

        command.Id = id;
        command.UpdatedBy = CurrentUserEmail;
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Email template {TemplateId} updated successfully", id);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Delete an email template
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogWarning("Deleting email template ID: {TemplateId} by user: {UserEmail}",
            id, CurrentUserEmail);

        var command = new DeleteEmailTemplateCommand { Id = id };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogWarning("Email template {TemplateId} deleted by {UserEmail}", id, CurrentUserEmail);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Toggle email template active status
    /// </summary>
    [HttpPatch("{id}/toggle-active")]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplateDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        _logger.LogInformation("Toggling active status for email template ID: {TemplateId}", id);

        var command = new ToggleEmailTemplateStatusCommand { Id = id };
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("Email template {TemplateId} status toggled to {IsActive}",
                id, result.Value.IsActive);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Preview an email template with sample data
    /// </summary>
    [HttpPost("{id}/preview")]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplatePreviewDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Preview(Guid id, [FromBody] PreviewEmailTemplateRequest? request)
    {
        _logger.LogInformation("Previewing email template ID: {TemplateId}", id);

        var query = new PreviewEmailTemplateQuery
        {
            Id = id,
            SampleData = request?.SampleData
        };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Validate email template syntax
    /// </summary>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(ApiResponse<EmailTemplateValidationDto>), 200)]
    public async Task<IActionResult> Validate([FromBody] ValidateEmailTemplateRequest request)
    {
        _logger.LogInformation("Validating email template syntax");

        var query = new ValidateEmailTemplateQuery
        {
            Subject = request.Subject,
            HtmlBody = request.HtmlBody,
            PlainTextBody = request.PlainTextBody
        };
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }
}

/// <summary>
/// Request model for template preview
/// </summary>
public class PreviewEmailTemplateRequest
{
    public string? SampleData { get; set; }
}

/// <summary>
/// Request model for template validation
/// </summary>
public class ValidateEmailTemplateRequest
{
    public string Subject { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
    public string? PlainTextBody { get; set; }
}
