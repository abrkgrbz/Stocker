using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

public class UpdateEmailTemplateCommandHandler : IRequestHandler<UpdateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpdateEmailTemplateCommandHandler> _logger;

    public UpdateEmailTemplateCommandHandler(
        IMasterDbContext context,
        ILogger<UpdateEmailTemplateCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<EmailTemplateDto>> Handle(UpdateEmailTemplateCommand request, CancellationToken cancellationToken)
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

            // Update content
            template.UpdateContent(
                name: request.Name,
                subject: request.Subject,
                htmlBody: request.HtmlBody,
                description: request.Description,
                plainTextBody: request.PlainTextBody,
                updatedBy: request.UpdatedBy
            );

            // Update variables if provided
            if (request.Variables != null)
            {
                var variablesJson = JsonSerializer.Serialize(request.Variables);
                template.UpdateVariables(variablesJson, request.SampleData);
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email template '{TemplateKey}' (ID: {TemplateId}) updated",
                template.TemplateKey, template.Id);

            var dto = MapToDto(template);
            return Result<EmailTemplateDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating email template {TemplateId}", request.Id);
            return Result<EmailTemplateDto>.Failure(
                Error.Failure("EmailTemplate.UpdateFailed", "Failed to update email template"));
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
