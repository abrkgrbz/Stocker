using Microsoft.EntityFrameworkCore;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Master.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Repositories;

/// <summary>
/// Repository implementation for email template operations
/// </summary>
public class EmailTemplateRepository : IEmailTemplateRepository
{
    private readonly MasterDbContext _masterContext;

    public EmailTemplateRepository(MasterDbContext masterContext)
    {
        _masterContext = masterContext;
    }

    /// <inheritdoc />
    public async Task<EmailTemplate?> GetByKeyAsync(
        string templateKey,
        string language = "tr",
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        // First try to find tenant-specific template
        if (tenantId.HasValue)
        {
            var tenantTemplate = await _masterContext.EmailTemplates
                .Where(t => t.TemplateKey == templateKey
                         && t.Language == language
                         && t.TenantId == tenantId.Value
                         && t.IsActive)
                .FirstOrDefaultAsync(cancellationToken);

            if (tenantTemplate != null)
                return tenantTemplate;
        }

        // Fall back to system template
        return await _masterContext.EmailTemplates
            .Where(t => t.TemplateKey == templateKey
                     && t.Language == language
                     && t.TenantId == null
                     && t.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<EmailTemplate>> GetAllAsync(
        Guid? tenantId = null,
        EmailTemplateCategory? category = null,
        bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var query = _masterContext.EmailTemplates.AsQueryable();

        // Filter by tenant (null = system templates, or specific tenant)
        if (tenantId.HasValue)
        {
            // Include both system templates and tenant-specific templates
            query = query.Where(t => t.TenantId == null || t.TenantId == tenantId.Value);
        }
        else
        {
            // Only system templates
            query = query.Where(t => t.TenantId == null);
        }

        if (category.HasValue)
        {
            query = query.Where(t => t.Category == category.Value);
        }

        if (!includeInactive)
        {
            query = query.Where(t => t.IsActive);
        }

        return await query
            .OrderBy(t => t.Category)
            .ThenBy(t => t.TemplateKey)
            .ThenBy(t => t.Language)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<EmailTemplate>> GetSystemTemplatesAsync(
        string? language = null,
        CancellationToken cancellationToken = default)
    {
        var query = _masterContext.EmailTemplates
            .Where(t => t.TenantId == null && t.IsSystem);

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(t => t.Language == language);
        }

        return await query
            .OrderBy(t => t.Category)
            .ThenBy(t => t.TemplateKey)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<EmailTemplate>> GetTenantTemplatesAsync(
        Guid tenantId,
        string? language = null,
        CancellationToken cancellationToken = default)
    {
        var query = _masterContext.EmailTemplates
            .Where(t => t.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(t => t.Language == language);
        }

        return await query
            .OrderBy(t => t.Category)
            .ThenBy(t => t.TemplateKey)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<EmailTemplate?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _masterContext.EmailTemplates
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<EmailTemplate> CreateAsync(
        EmailTemplate template,
        CancellationToken cancellationToken = default)
    {
        _masterContext.EmailTemplates.Add(template);
        await _masterContext.SaveChangesAsync(cancellationToken);
        return template;
    }

    /// <inheritdoc />
    public async Task<EmailTemplate> UpdateAsync(
        EmailTemplate template,
        CancellationToken cancellationToken = default)
    {
        _masterContext.EmailTemplates.Update(template);
        await _masterContext.SaveChangesAsync(cancellationToken);
        return template;
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var template = await _masterContext.EmailTemplates
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (template == null)
            return false;

        // Don't allow deleting system templates
        if (template.IsSystem)
            return false;

        _masterContext.EmailTemplates.Remove(template);
        await _masterContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(
        string templateKey,
        string language,
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        return await _masterContext.EmailTemplates
            .AnyAsync(t => t.TemplateKey == templateKey
                        && t.Language == language
                        && t.TenantId == tenantId,
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<string>> GetTemplateKeysAsync(
        CancellationToken cancellationToken = default)
    {
        return await _masterContext.EmailTemplates
            .Where(t => t.TenantId == null) // Only system template keys
            .Select(t => t.TemplateKey)
            .Distinct()
            .OrderBy(k => k)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<EmailTemplate?> CreateTenantCopyAsync(
        Guid tenantId,
        string templateKey,
        string language,
        CancellationToken cancellationToken = default)
    {
        // Get the system template
        var systemTemplate = await _masterContext.EmailTemplates
            .FirstOrDefaultAsync(t => t.TemplateKey == templateKey
                                   && t.Language == language
                                   && t.TenantId == null,
                cancellationToken);

        if (systemTemplate == null)
            return null;

        // Check if tenant already has this template
        var exists = await ExistsAsync(templateKey, language, tenantId, cancellationToken);
        if (exists)
            return null;

        // Create tenant copy
        var tenantTemplate = EmailTemplate.CreateForTenant(
            tenantId: tenantId,
            templateKey: systemTemplate.TemplateKey,
            name: systemTemplate.Name,
            subject: systemTemplate.Subject,
            htmlBody: systemTemplate.HtmlBody,
            language: systemTemplate.Language,
            category: systemTemplate.Category,
            variables: systemTemplate.Variables,
            description: systemTemplate.Description,
            plainTextBody: systemTemplate.PlainTextBody,
            sampleData: systemTemplate.SampleData);

        _masterContext.EmailTemplates.Add(tenantTemplate);
        await _masterContext.SaveChangesAsync(cancellationToken);

        return tenantTemplate;
    }

    /// <inheritdoc />
    public async Task<bool> ResetToSystemDefaultAsync(
        Guid tenantId,
        string templateKey,
        string language,
        CancellationToken cancellationToken = default)
    {
        var tenantTemplate = await _masterContext.EmailTemplates
            .FirstOrDefaultAsync(t => t.TemplateKey == templateKey
                                   && t.Language == language
                                   && t.TenantId == tenantId,
                cancellationToken);

        if (tenantTemplate == null)
            return false;

        _masterContext.EmailTemplates.Remove(tenantTemplate);
        await _masterContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
