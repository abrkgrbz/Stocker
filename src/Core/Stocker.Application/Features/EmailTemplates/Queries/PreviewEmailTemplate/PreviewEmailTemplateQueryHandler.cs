using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Queries.PreviewEmailTemplate;

public class PreviewEmailTemplateQueryHandler : IRequestHandler<PreviewEmailTemplateQuery, Result<EmailTemplatePreviewDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILiquidTemplateService _liquidTemplateService;
    private readonly ILogger<PreviewEmailTemplateQueryHandler> _logger;

    public PreviewEmailTemplateQueryHandler(
        IMasterDbContext context,
        ILiquidTemplateService liquidTemplateService,
        ILogger<PreviewEmailTemplateQueryHandler> logger)
    {
        _context = context;
        _liquidTemplateService = liquidTemplateService;
        _logger = logger;
    }

    public async Task<Result<EmailTemplatePreviewDto>> Handle(PreviewEmailTemplateQuery request, CancellationToken cancellationToken)
    {
        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (template == null)
        {
            return Result<EmailTemplatePreviewDto>.Failure(
                Error.NotFound("EmailTemplate.NotFound", $"Email template with ID '{request.Id}' not found"));
        }

        try
        {
            // Use provided sample data or fall back to template's sample data
            var sampleDataJson = !string.IsNullOrEmpty(request.SampleData)
                ? request.SampleData
                : template.SampleData;

            object? data = null;
            if (!string.IsNullOrEmpty(sampleDataJson))
            {
                data = JsonSerializer.Deserialize<Dictionary<string, object>>(sampleDataJson);
            }

            data ??= new Dictionary<string, object>();

            // Render subject
            var subjectResult = await _liquidTemplateService.RenderAsync(template.Subject, data, cancellationToken);
            if (!subjectResult.IsSuccess)
            {
                return Result<EmailTemplatePreviewDto>.Success(new EmailTemplatePreviewDto
                {
                    IsSuccess = false,
                    ErrorMessage = $"Subject render error: {subjectResult.ErrorMessage}"
                });
            }

            // Render body
            var bodyResult = await _liquidTemplateService.RenderAsync(template.HtmlBody, data, cancellationToken);
            if (!bodyResult.IsSuccess)
            {
                return Result<EmailTemplatePreviewDto>.Success(new EmailTemplatePreviewDto
                {
                    Subject = subjectResult.RenderedContent!,
                    IsSuccess = false,
                    ErrorMessage = $"Body render error: {bodyResult.ErrorMessage}"
                });
            }

            // Render plain text if available
            string? plainTextBody = null;
            if (!string.IsNullOrEmpty(template.PlainTextBody))
            {
                var plainTextResult = await _liquidTemplateService.RenderAsync(template.PlainTextBody, data, cancellationToken);
                if (plainTextResult.IsSuccess)
                {
                    plainTextBody = plainTextResult.RenderedContent;
                }
            }

            return Result<EmailTemplatePreviewDto>.Success(new EmailTemplatePreviewDto
            {
                Subject = subjectResult.RenderedContent!,
                HtmlBody = bodyResult.RenderedContent!,
                PlainTextBody = plainTextBody,
                IsSuccess = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error previewing email template {TemplateId}", request.Id);
            return Result<EmailTemplatePreviewDto>.Success(new EmailTemplatePreviewDto
            {
                IsSuccess = false,
                ErrorMessage = $"Preview error: {ex.Message}"
            });
        }
    }
}
