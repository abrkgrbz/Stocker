using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Commands.ToggleEmailTemplateStatus;

public class ToggleEmailTemplateStatusCommandHandler : IRequestHandler<ToggleEmailTemplateStatusCommand, Result<EmailTemplateDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<ToggleEmailTemplateStatusCommandHandler> _logger;

    public ToggleEmailTemplateStatusCommandHandler(
        IMasterDbContext context,
        ILogger<ToggleEmailTemplateStatusCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<EmailTemplateDto>> Handle(ToggleEmailTemplateStatusCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var template = await _context.EmailTemplates
                .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (template == null)
            {
                return Result<EmailTemplateDto>.Failure(
                    Error.NotFound("EmailTemplate.NotFound", $"Email template with ID '{request.Id}' not found"));
            }

            // Toggle status
            if (template.IsActive)
            {
                template.Deactivate();
            }
            else
            {
                template.Activate();
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email template '{TemplateKey}' (ID: {TemplateId}) status toggled to {IsActive}",
                template.TemplateKey, template.Id, template.IsActive);

            var dto = MapToDto(template);
            return Result<EmailTemplateDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot toggle status for template {TemplateId}", request.Id);
            return Result<EmailTemplateDto>.Failure(
                Error.Validation("EmailTemplate.CannotToggle", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling email template status {TemplateId}", request.Id);
            return Result<EmailTemplateDto>.Failure(
                Error.Failure("EmailTemplate.ToggleFailed", "Failed to toggle email template status"));
        }
    }

    private static EmailTemplateDto MapToDto(Domain.Master.Entities.EmailTemplate template)
    {
        var variables = new List<string>();
        try
        {
            if (!string.IsNullOrEmpty(template.Variables))
            {
                variables = JsonSerializer.Deserialize<List<string>>(template.Variables) ?? new List<string>();
            }
        }
        catch { /* Ignore parsing errors */ }

        return new EmailTemplateDto
        {
            Id = template.Id,
            TenantId = template.TenantId,
            TemplateKey = template.TemplateKey,
            Name = template.Name,
            Description = template.Description,
            Subject = template.Subject,
            HtmlBody = template.HtmlBody,
            PlainTextBody = template.PlainTextBody,
            Language = template.Language,
            Category = template.Category.ToString(),
            Variables = variables,
            SampleData = template.SampleData,
            IsActive = template.IsActive,
            IsSystem = template.IsSystem,
            Version = template.Version,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
            CreatedBy = template.CreatedBy,
            UpdatedBy = template.UpdatedBy
        };
    }
}
