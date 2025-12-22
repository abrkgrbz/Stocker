using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.EmailTemplate;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplatesList;

public class GetEmailTemplatesListQueryHandler : IRequestHandler<GetEmailTemplatesListQuery, Result<EmailTemplateListDto>>
{
    private readonly IMasterDbContext _context;

    public GetEmailTemplatesListQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EmailTemplateListDto>> Handle(GetEmailTemplatesListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.EmailTemplates
            .Where(t => t.TenantId == null) // Only system templates in master
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.Category) &&
            Enum.TryParse<EmailTemplateCategory>(request.Category, true, out var category))
        {
            query = query.Where(t => t.Category == category);
        }

        if (!string.IsNullOrEmpty(request.Language))
        {
            query = query.Where(t => t.Language == request.Language);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(t => t.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(t =>
                t.TemplateKey.ToLower().Contains(searchTerm) ||
                t.Name.ToLower().Contains(searchTerm) ||
                (t.Description != null && t.Description.ToLower().Contains(searchTerm)));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var templates = await query
            .OrderBy(t => t.Category)
            .ThenBy(t => t.TemplateKey)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = templates.Select(MapToDto).ToList();

        return Result<EmailTemplateListDto>.Success(new EmailTemplateListDto
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        });
    }

    private static EmailTemplateDto MapToDto(EmailTemplate template)
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
