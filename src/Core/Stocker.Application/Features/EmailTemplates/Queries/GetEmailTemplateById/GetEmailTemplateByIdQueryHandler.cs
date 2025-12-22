using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplateById;

public class GetEmailTemplateByIdQueryHandler : IRequestHandler<GetEmailTemplateByIdQuery, Result<EmailTemplateDto>>
{
    private readonly IMasterDbContext _context;

    public GetEmailTemplateByIdQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EmailTemplateDto>> Handle(GetEmailTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (template == null)
        {
            return Result<EmailTemplateDto>.Failure(
                Error.NotFound("EmailTemplate.NotFound", $"Email template with ID '{request.Id}' not found"));
        }

        return Result<EmailTemplateDto>.Success(MapToDto(template));
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
