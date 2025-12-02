using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Services;

/// <summary>
/// Service for retrieving tenant module subscriptions from database
/// Implements caching for performance optimization
/// Uses IDbContextFactory to avoid DbContext concurrency issues
/// </summary>
public class TenantModuleService : ITenantModuleService
{
    private readonly IDbContextFactory<MasterDbContext> _dbContextFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TenantModuleService> _logger;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

    public TenantModuleService(
        IDbContextFactory<MasterDbContext> dbContextFactory,
        IMemoryCache cache,
        ILogger<TenantModuleService> logger)
    {
        _dbContextFactory = dbContextFactory;
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

        // If not in cache, query from database with a dedicated DbContext instance
        _logger.LogDebug("Fetching tenant {TenantId} modules from database", tenantId);

        // Use IDbContextFactory to create a new DbContext instance for this operation
        // This avoids concurrency issues when multiple queries are needed
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync(cancellationToken);

        // Get active subscription for tenant - use AsNoTracking for read-only queries
        var subscription = await dbContext.Subscriptions
            .AsNoTracking()
            .Where(s => s.TenantId == tenantId &&
                       (s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif ||
                        s.Status == Domain.Master.Enums.SubscriptionStatus.Deneme))
            .OrderByDescending(s => s.StartDate) // Get most recent subscription
            .Select(s => new
            {
                s.TenantId,
                s.PackageId,
                PackageName = s.Package != null ? s.Package.Name : null
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Fallback: Try TenantRegistration if no subscription found (for backward compatibility)
        if (subscription == null)
        {
            _logger.LogDebug("No active subscription found for TenantId {TenantId}, checking TenantRegistration", tenantId);

            var tenantRegistration = await dbContext.TenantRegistrations
                .AsNoTracking()
                .Where(tr => tr.TenantId == tenantId)
                .Select(tr => new
                {
                    tr.TenantId,
                    PackageId = tr.SelectedPackageId,
                    PackageName = tr.SelectedPackage != null ? tr.SelectedPackage.Name : null
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (tenantRegistration != null && tenantRegistration.PackageId.HasValue && tenantRegistration.TenantId.HasValue)
            {
                subscription = new
                {
                    TenantId = tenantRegistration.TenantId.Value,
                    PackageId = tenantRegistration.PackageId.Value,
                    tenantRegistration.PackageName
                };
            }
        }

        if (subscription == null)
        {
            _logger.LogWarning("No subscription or registration found for TenantId {TenantId}", tenantId);
            return new List<string>();
        }

        // Get subscribed modules from package
        var subscribedModules = new List<string>();

        if (subscription.PackageId != Guid.Empty)
        {
            // Get package modules from PackageModules table
            // Use ModuleCode (not ModuleName) and filter by IsIncluded
            var packageModules = await dbContext.PackageModules
                .AsNoTracking()
                .Where(pm => pm.PackageId == subscription.PackageId && pm.IsIncluded)
                .Select(pm => pm.ModuleCode)
                .ToListAsync(cancellationToken);

            subscribedModules = packageModules;

            _logger.LogInformation(
                "Tenant {TenantId} subscribed to package '{Package}' ({PackageId}) with {Count} modules: {Modules}",
                tenantId,
                subscription.PackageName ?? "Unknown",
                subscription.PackageId,
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

        // Normalize module names for comparison (remove common suffixes like "Modülü", "Module", etc.)
        var normalizedRequestedModule = NormalizeModuleName(moduleName);
        var hasAccess = subscribedModules.Any(m =>
            NormalizeModuleName(m).Equals(normalizedRequestedModule, StringComparison.OrdinalIgnoreCase));

        _logger.LogDebug(
            "Tenant {TenantId} module access check for {Module} (normalized: {NormalizedModule}): {HasAccess}. Subscribed modules: {SubscribedModules}",
            tenantId,
            moduleName,
            normalizedRequestedModule,
            hasAccess,
            string.Join(", ", subscribedModules));

        return hasAccess;
    }

    /// <summary>
    /// Normalizes module names by removing common suffixes and trimming whitespace
    /// Handles Turkish/English variations like "CRM Modülü" → "CRM", "Sales Module" → "Sales"
    /// </summary>
    private static string NormalizeModuleName(string moduleName)
    {
        if (string.IsNullOrWhiteSpace(moduleName))
            return string.Empty;

        var normalized = moduleName.Trim();

        // Remove common Turkish/English suffixes
        var suffixesToRemove = new[] { " Modülü", " Module", " Modulu" };
        foreach (var suffix in suffixesToRemove)
        {
            if (normalized.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
            {
                normalized = normalized.Substring(0, normalized.Length - suffix.Length).Trim();
            }
        }

        return normalized;
    }

    public async Task<TenantModuleInfo?> GetTenantByCodeAsync(string tenantCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(tenantCode))
        {
            _logger.LogWarning("Tenant code is empty");
            return null;
        }

        _logger.LogDebug("Looking up tenant by code: {TenantCode}", tenantCode);

        // Use IDbContextFactory to create a new DbContext instance for this operation
        await using var dbContext = await _dbContextFactory.CreateDbContextAsync(cancellationToken);

        // Query tenant from master database by code (case-insensitive)
        var tenant = await dbContext.Tenants
            .AsNoTracking()
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
