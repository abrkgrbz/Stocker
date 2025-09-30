using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Persistence.Services;

public class TenantResolver : ITenantResolver
{
    private readonly MasterDbContext _masterDbContext;

    public TenantResolver(MasterDbContext masterDbContext)
    {
        _masterDbContext = masterDbContext ?? throw new ArgumentNullException(nameof(masterDbContext));
    }

    public async Task<TenantInfo?> ResolveAsync(string identifier)
    {
        var tenant = await _masterDbContext.Tenants
            .Include(t => t.Domains)
            // Features moved to Tenant domain
            .FirstOrDefaultAsync(t => 
                t.Code == identifier || 
                t.Domains.Any(d => d.DomainName == identifier && d.IsVerified));

        return MapToTenantInfo(tenant);
    }

    public async Task<TenantInfo?> ResolveByIdAsync(Guid tenantId)
    {
        var tenant = await _masterDbContext.Tenants
            .Include(t => t.Domains)
            // Features moved to Tenant domain
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        return MapToTenantInfo(tenant);
    }

    public async Task<TenantInfo?> ResolveByDomainAsync(string domain)
    {
        var tenant = await _masterDbContext.Tenants
            .Include(t => t.Domains)
            // Features moved to Tenant domain
            .FirstOrDefaultAsync(t => t.Domains.Any(d => d.DomainName == domain.ToLowerInvariant() && d.IsVerified));

        return MapToTenantInfo(tenant);
    }

    public async Task<TenantInfo?> ResolveByHeaderAsync(string headerValue)
    {
        // Header value could be tenant ID or identifier
        if (Guid.TryParse(headerValue, out var tenantId))
        {
            return await ResolveByIdAsync(tenantId);
        }

        return await ResolveAsync(headerValue);
    }

    private TenantInfo? MapToTenantInfo(Tenant? tenant)
    {
        if (tenant == null || !tenant.IsActive)
            return null;

        var tenantInfo = new TenantInfo
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Identifier = tenant.Code,
            ConnectionString = tenant.ConnectionString.Value,
            IsActive = tenant.IsActive,
            Properties = new Dictionary<string, string>()
        };

        // Add additional info if available
        if (!string.IsNullOrEmpty(tenant.Description))
            tenantInfo.Properties["Description"] = tenant.Description;

        if (!string.IsNullOrEmpty(tenant.LogoUrl))
            tenantInfo.Properties["LogoUrl"] = tenant.LogoUrl;

        // Add primary domain if available
        var primaryDomain = tenant.Domains.FirstOrDefault(d => d.IsPrimary && d.IsVerified);
        if (primaryDomain != null)
            tenantInfo.Properties["PrimaryDomain"] = primaryDomain.DomainName;

        // Features moved to Tenant domain - feature information should be retrieved from Tenant context

        return tenantInfo;
    }
}