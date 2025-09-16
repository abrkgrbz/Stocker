using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Persistence.Master;
using System.Text.Json;

namespace Stocker.Application.Tenants.Queries.GetTenantBySlug;

public class GetTenantBySlugQueryHandler : IRequestHandler<GetTenantBySlugQuery, GetTenantBySlugResponse>
{
    private readonly MasterDbContext _context;
    private readonly ILogger<GetTenantBySlugQueryHandler> _logger;

    public GetTenantBySlugQueryHandler(
        MasterDbContext context,
        ILogger<GetTenantBySlugQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<GetTenantBySlugResponse> Handle(GetTenantBySlugQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Getting tenant by slug: {Slug}", request.Slug);

            // Normalize slug
            var normalizedSlug = request.Slug.ToLowerInvariant().Trim();
            
            // Create full domain to check
            var fullDomain = $"{normalizedSlug}.stoocker.app";

            // First, check TenantDomains table for custom domains
            var tenantDomain = await _context.TenantDomains
                .Where(td => td.DomainName.ToLower() == fullDomain && td.IsActive)
                .Select(td => new { td.TenantId })
                .FirstOrDefaultAsync(cancellationToken);

            Guid? tenantId = tenantDomain?.TenantId;

            // If not found in TenantDomains, check Tenants table
            var tenant = await _context.Tenants
                .Where(t => (tenantId != null && t.Id == tenantId) ||
                           (t.Domain != null && t.Domain.ToLower() == fullDomain) ||
                           (t.Slug != null && t.Slug.ToLower() == normalizedSlug) ||
                           t.Identifier.ToLower() == normalizedSlug)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Identifier,
                    t.Slug,
                    t.Domain,
                    t.IsActive,
                    t.Settings
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (tenant == null)
            {
                _logger.LogWarning("No tenant found with slug: {Slug} or domain: {Domain}", request.Slug, fullDomain);
                return new GetTenantBySlugResponse
                {
                    Exists = false,
                    IsActive = false,
                    Message = $"No tenant found with slug: {request.Slug}"
                };
            }

            // Parse settings if they exist
            string? primaryColor = null;
            string? secondaryColor = null;
            string? logo = null;

            if (!string.IsNullOrEmpty(tenant.Settings))
            {
                try
                {
                    var settings = JsonSerializer.Deserialize<Dictionary<string, object>>(tenant.Settings);
                    if (settings != null)
                    {
                        primaryColor = settings.ContainsKey("primaryColor") ? settings["primaryColor"]?.ToString() : null;
                        secondaryColor = settings.ContainsKey("secondaryColor") ? settings["secondaryColor"]?.ToString() : null;
                        logo = settings.ContainsKey("logo") ? settings["logo"]?.ToString() : null;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing tenant settings for tenant {TenantId}", tenant.Id);
                }
            }

            return new GetTenantBySlugResponse
            {
                Exists = true,
                IsActive = tenant.IsActive,
                Id = tenant.Id,
                Name = tenant.Name,
                Slug = tenant.Slug ?? tenant.Identifier,
                PrimaryColor = primaryColor ?? "#667eea",
                SecondaryColor = secondaryColor ?? "#764ba2",
                Logo = logo
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenant by slug: {Slug}", request.Slug);
            throw;
        }
    }
}