using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Interfaces.Repositories;

/// <summary>
/// Repository interface for email template operations
/// </summary>
public interface IEmailTemplateRepository
{
    /// <summary>
    /// Gets a template by key and language, with tenant fallback logic.
    /// First checks for tenant-specific template, then falls back to system template.
    /// </summary>
    /// <param name="templateKey">The template key (e.g., "user-invitation")</param>
    /// <param name="language">The language code (e.g., "tr")</param>
    /// <param name="tenantId">Optional tenant ID for tenant-specific templates</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The template or null if not found</returns>
    Task<EmailTemplate?> GetByKeyAsync(
        string templateKey,
        string language = "tr",
        Guid? tenantId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all templates for a tenant (including system templates)
    /// </summary>
    Task<List<EmailTemplate>> GetAllAsync(
        Guid? tenantId = null,
        EmailTemplateCategory? category = null,
        bool includeInactive = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all system templates
    /// </summary>
    Task<List<EmailTemplate>> GetSystemTemplatesAsync(
        string? language = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all tenant-specific templates
    /// </summary>
    Task<List<EmailTemplate>> GetTenantTemplatesAsync(
        Guid tenantId,
        string? language = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a template by ID
    /// </summary>
    Task<EmailTemplate?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new template
    /// </summary>
    Task<EmailTemplate> CreateAsync(
        EmailTemplate template,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing template
    /// </summary>
    Task<EmailTemplate> UpdateAsync(
        EmailTemplate template,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a template (only non-system templates)
    /// </summary>
    Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a template key exists for a tenant/language combination
    /// </summary>
    Task<bool> ExistsAsync(
        string templateKey,
        string language,
        Guid? tenantId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available template keys (for validation/autocomplete)
    /// </summary>
    Task<List<string>> GetTemplateKeysAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a tenant-specific copy of a system template
    /// </summary>
    Task<EmailTemplate?> CreateTenantCopyAsync(
        Guid tenantId,
        string templateKey,
        string language,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Resets a tenant template to system default (deletes tenant override)
    /// </summary>
    Task<bool> ResetToSystemDefaultAsync(
        Guid tenantId,
        string templateKey,
        string language,
        CancellationToken cancellationToken = default);
}
