using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;

public class CreateEmailTemplateCommandHandler : IRequestHandler<CreateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateEmailTemplateCommandHandler> _logger;

    public CreateEmailTemplateCommandHandler(
        IMasterDbContext context,
        ILogger<CreateEmailTemplateCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<EmailTemplateDto>> Handle(CreateEmailTemplateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if template key already exists for the same language
            var existingTemplate = await _context.EmailTemplates
                .AnyAsync(t => t.TemplateKey == request.TemplateKey &&
                              t.Language == request.Language &&
                              t.TenantId == null, cancellationToken);

            if (existingTemplate)
            {
                return Result<EmailTemplateDto>.Failure(
                    Error.Conflict("EmailTemplate.AlreadyExists",
                        $"Template with key '{request.TemplateKey}' and language '{request.Language}' already exists"));
            }

            // Parse category
            if (!Enum.TryParse<EmailTemplateCategory>(request.Category, true, out var category))
            {
                category = EmailTemplateCategory.System;
            }

            // Convert variables list to JSON
            var variablesJson = JsonSerializer.Serialize(request.Variables);

            // Create system template using factory method
            var template = Domain.Master.Entities.EmailTemplate.CreateSystem(
                templateKey: request.TemplateKey,
                name: request.Name,
                subject: request.Subject,
                htmlBody: request.HtmlBody,
                language: request.Language,
                category: category,
                variables: variablesJson,
                description: request.Description,
                plainTextBody: request.PlainTextBody,
                sampleData: request.SampleData
            );

            _context.EmailTemplates.Add(template);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email template '{TemplateKey}' created with ID {TemplateId}",
                template.TemplateKey, template.Id);

            var dto = MapToDto(template);
            return Result<EmailTemplateDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating email template");
            return Result<EmailTemplateDto>.Failure(
                Error.Failure("EmailTemplate.CreateFailed", "Failed to create email template"));
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
