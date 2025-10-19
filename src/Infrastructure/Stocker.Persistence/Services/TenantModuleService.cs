using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Services;

/// <summary>
/// Service for retrieving tenant module subscriptions from database
/// Implements caching for performance optimization
/// </summary>
public class TenantModuleService : ITenantModuleService
{
    private readonly MasterDbContext _masterDbContext;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TenantModuleService> _logger;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

    public TenantModuleService(
        MasterDbContext masterDbContext,
        IMemoryCache cache,
        ILogger<TenantModuleService> logger)
    {
        _masterDbContext = masterDbContext;
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<string>> GetSubscribedModulesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // Try to get from cache first
        var cacheKey = $"tenant_modules:{tenantId}";

        if (_cache.TryGetValue<List<string>>(cacheKey, out var cachedModules))
        {
            _logger.LogDebug("Retrieved tenant {TenantId} modules from cache", tenantId);
            return cachedModules ?? new List<string>();
        }

        // If not in cache, query from database
        _logger.LogDebug("Fetching tenant {TenantId} modules from database", tenantId);

        // Get tenant registration with selected package and its modules
        var tenantRegistration = await _masterDbContext.TenantRegistrations
            .Include(tr => tr.SelectedPackage)
            .FirstOrDefaultAsync(tr => tr.Id == tenantId, cancellationToken);

        if (tenantRegistration == null)
        {
            _logger.LogWarning("Tenant {TenantId} not found in database", tenantId);
            return new List<string>();
        }

        // Get subscribed modules from package
        var subscribedModules = new List<string>();

        if (tenantRegistration.SelectedPackage != null && tenantRegistration.SelectedPackageId.HasValue)
        {
            // Get package modules from PackageModules table
            var packageModules = await _masterDbContext.PackageModules
                .Where(pm => pm.PackageId == tenantRegistration.SelectedPackageId.Value)
                .Select(pm => pm.ModuleName)
                .ToListAsync(cancellationToken);

            subscribedModules = packageModules;

            _logger.LogInformation(
                "Tenant {TenantId} subscribed to package '{Package}' with {Count} modules: {Modules}",
                tenantId,
                tenantRegistration.SelectedPackage.Name,
                subscribedModules.Count,
                string.Join(", ", subscribedModules));
        }
        else
        {
            _logger.LogWarning(
                "Tenant {TenantId} has no package selected",
                tenantId);
        }

        // Cache the result
        _cache.Set(cacheKey, subscribedModules, CacheDuration);

        _logger.LogInformation(
            "Tenant {TenantId} has {ModuleCount} subscribed modules: {Modules}",
            tenantId,
            subscribedModules.Count,
            string.Join(", ", subscribedModules));

        return subscribedModules;
    }

    public async Task<bool> HasModuleAccessAsync(Guid tenantId, string moduleName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(moduleName))
        {
            _logger.LogWarning("Module name is empty for tenant {TenantId}", tenantId);
            return false;
        }

        var subscribedModules = await GetSubscribedModulesAsync(tenantId, cancellationToken);
        var hasAccess = subscribedModules.Contains(moduleName, StringComparer.OrdinalIgnoreCase);

        _logger.LogDebug(
            "Tenant {TenantId} module access check for {Module}: {HasAccess}",
            tenantId,
            moduleName,
            hasAccess);

        return hasAccess;
    }

    public async Task<TenantModuleInfo?> GetTenantByCodeAsync(string tenantCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(tenantCode))
        {
            _logger.LogWarning("Tenant code is empty");
            return null;
        }

        _logger.LogDebug("Looking up tenant by code: {TenantCode}", tenantCode);

        // Query tenant from master database by code (case-insensitive)
        var tenant = await _masterDbContext.Tenants
            .Where(t => t.Code.ToLower() == tenantCode.ToLower())
            .Select(t => new TenantModuleInfo
            {
                Id = t.Id,
                Code = t.Code,
                Name = t.Name
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant == null)
        {
            _logger.LogWarning("Tenant not found for code: {TenantCode}", tenantCode);
            return null;
        }

        _logger.LogInformation(
            "Found tenant {TenantId} ({TenantName}) for code {TenantCode}",
            tenant.Id,
            tenant.Name,
            tenantCode);

        return tenant;
    }

    /// <summary>
    /// Invalidates the cache for a specific tenant's modules
    /// Call this when tenant's module subscription changes
    /// </summary>
    public void InvalidateCache(Guid tenantId)
    {
        var cacheKey = $"tenant_modules:{tenantId}";
        _cache.Remove(cacheKey);
        _logger.LogInformation("Invalidated module cache for tenant {TenantId}", tenantId);
    }
}
