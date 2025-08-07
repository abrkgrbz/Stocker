using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Infrastructure.Middleware;
using Stocker.Persistence.Contexts;

namespace Stocker.Infrastructure.Services;

public class TenantResolverService : ITenantResolverService
{
    private readonly MasterDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TenantResolverService> _logger;
    private const string CACHE_KEY_PREFIX = "tenant_";
    private const int CACHE_DURATION_MINUTES = 5;

    public TenantResolverService(
        MasterDbContext context,
        IMemoryCache cache,
        ILogger<TenantResolverService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<TenantInfo?> GetTenantByCodeAsync(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return null;

        var cacheKey = $"{CACHE_KEY_PREFIX}code_{code.ToLower()}";
        
        if (_cache.TryGetValue<TenantInfo>(cacheKey, out var cachedTenant))
        {
            _logger.LogDebug("Tenant found in cache for code: {Code}", code);
            return cachedTenant;
        }

        var tenant = await _context.Tenants
            .Where(t => t.Code.ToLower() == code.ToLower() && t.IsActive)
            .Select(t => new TenantInfo
            {
                Id = t.Id,
                Name = t.Name,
                Code = t.Code,
                Domain = _context.TenantDomains
                    .Where(td => td.TenantId == t.Id && td.IsPrimary)
                    .Select(td => td.DomainName)
                    .FirstOrDefault(),
                IsActive = t.IsActive
            })
            .FirstOrDefaultAsync();

        if (tenant != null)
        {
            _cache.Set(cacheKey, tenant, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
            _logger.LogInformation("Tenant resolved by code: {Code} -> {TenantId}", code, tenant.Id);
        }

        return tenant;
    }

    public async Task<TenantInfo?> GetTenantByDomainAsync(string domain)
    {
        if (string.IsNullOrWhiteSpace(domain))
            return null;

        var cacheKey = $"{CACHE_KEY_PREFIX}domain_{domain.ToLower()}";
        
        if (_cache.TryGetValue<TenantInfo>(cacheKey, out var cachedTenant))
        {
            _logger.LogDebug("Tenant found in cache for domain: {Domain}", domain);
            return cachedTenant;
        }

        // Check TenantDomains table for the domain
        var tenant = await _context.TenantDomains
            .Where(td => td.DomainName.ToLower() == domain.ToLower())
            .Join(_context.Tenants,
                td => td.TenantId,
                t => t.Id,
                (td, t) => new { Domain = td, Tenant = t })
            .Where(x => x.Tenant.IsActive)
            .Select(x => new TenantInfo
            {
                Id = x.Tenant.Id,
                Name = x.Tenant.Name,
                Code = x.Tenant.Code,
                Domain = x.Domain.DomainName,
                IsActive = x.Tenant.IsActive
            })
            .FirstOrDefaultAsync();

        if (tenant != null)
        {
            _cache.Set(cacheKey, tenant, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
            _logger.LogInformation("Tenant resolved by domain: {Domain} -> {TenantId}", domain, tenant.Id);
        }

        return tenant;
    }

    public async Task<TenantInfo?> GetTenantByIdAsync(Guid id)
    {
        var cacheKey = $"{CACHE_KEY_PREFIX}id_{id}";
        
        if (_cache.TryGetValue<TenantInfo>(cacheKey, out var cachedTenant))
        {
            _logger.LogDebug("Tenant found in cache for id: {Id}", id);
            return cachedTenant;
        }

        var tenant = await _context.Tenants
            .Where(t => t.Id == id)
            .Select(t => new TenantInfo
            {
                Id = t.Id,
                Name = t.Name,
                Code = t.Code,
                Domain = _context.TenantDomains
                    .Where(td => td.TenantId == t.Id && td.IsPrimary)
                    .Select(td => td.DomainName)
                    .FirstOrDefault(),
                IsActive = t.IsActive
            })
            .FirstOrDefaultAsync();

        if (tenant != null)
        {
            _cache.Set(cacheKey, tenant, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
        }

        return tenant;
    }

    public void ClearCache(Guid tenantId)
    {
        // Clear all cache entries for this tenant
        _cache.Remove($"{CACHE_KEY_PREFIX}id_{tenantId}");
        
        // Note: We can't easily clear by code/domain without tracking them
        // In production, consider using distributed cache with tags
        _logger.LogInformation("Cache cleared for tenant: {TenantId}", tenantId);
    }
}