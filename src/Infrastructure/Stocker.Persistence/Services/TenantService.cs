using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Master.Entities;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Persistence.Services;

/// <summary>
/// Provides tenant context resolution and management for multi-tenant operations.
/// This service is stateless and uses HttpContext.Items for request-scoped storage.
/// </summary>
public class TenantService : ITenantService
{
    private const string TenantIdKey = "Tenant:Id";
    private const string TenantNameKey = "Tenant:Name";
    private const string TenantConnectionStringKey = "Tenant:ConnectionString";
    private const string TenantCacheKeyPrefix = "TenantInfo:";
    
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly MasterDbContext _masterDbContext;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TenantService> _logger;

    public TenantService(
        IHttpContextAccessor httpContextAccessor, 
        MasterDbContext masterDbContext,
        IMemoryCache cache,
        ILogger<TenantService> logger)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _masterDbContext = masterDbContext ?? throw new ArgumentNullException(nameof(masterDbContext));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public Guid? GetCurrentTenantId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            _logger.LogWarning("HttpContext is null, cannot resolve tenant");
            return null;
        }

        // Check if already resolved in this request
        if (httpContext.Items.TryGetValue(TenantIdKey, out var cachedTenantId) && cachedTenantId is Guid tenantId)
        {
            return tenantId;
        }

        // Try to resolve tenant
        var resolvedTenantId = ResolveTenantId(httpContext);
        if (resolvedTenantId.HasValue)
        {
            // Store in HttpContext.Items for this request
            httpContext.Items[TenantIdKey] = resolvedTenantId.Value;
            
            // Load and cache tenant info
            LoadTenantInfo(resolvedTenantId.Value, httpContext);
        }

        return resolvedTenantId;
    }

    public string? GetCurrentTenantName()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        // Check HttpContext.Items first
        if (httpContext.Items.TryGetValue(TenantNameKey, out var cachedName) && cachedName is string name)
        {
            return name;
        }

        // Ensure tenant is resolved
        var tenantId = GetCurrentTenantId();
        if (!tenantId.HasValue) return null;

        // Name should have been loaded with tenant info
        return httpContext.Items.TryGetValue(TenantNameKey, out var tenantName) ? tenantName as string : null;
    }

    public string? GetConnectionString()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        // Check HttpContext.Items first
        if (httpContext.Items.TryGetValue(TenantConnectionStringKey, out var cachedConnStr) && cachedConnStr is string connStr)
        {
            return connStr;
        }

        // Ensure tenant is resolved
        var tenantId = GetCurrentTenantId();
        if (!tenantId.HasValue) return null;

        // Connection string should have been loaded with tenant info
        return httpContext.Items.TryGetValue(TenantConnectionStringKey, out var connectionString) ? connectionString as string : null;
    }

    public async Task<bool> SetCurrentTenant(Guid tenantId)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            _logger.LogWarning("Cannot set tenant - HttpContext is null");
            return false;
        }

        // Try to get from cache first
        var cacheKey = $"{TenantCacheKeyPrefix}{tenantId}";

        // Check if already in cache
        if (_cache.TryGetValue<TenantInfo>(cacheKey, out var cachedTenantInfo))
        {

            // Store in HttpContext.Items
            httpContext.Items[TenantIdKey] = cachedTenantInfo.Id;
            httpContext.Items[TenantNameKey] = cachedTenantInfo.Name;
            httpContext.Items[TenantConnectionStringKey] = cachedTenantInfo.ConnectionString;

            _logger.LogInformation("Tenant {TenantId} ({TenantName}) set successfully from cache", cachedTenantInfo.Id, cachedTenantInfo.Name);
            return true;
        }

        // Not in cache, fetch from database
        var tenant = await _masterDbContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null || !tenant.IsActive)
        {
            _logger.LogWarning("Tenant {TenantId} not found or inactive", tenantId);
            return false;
        }

        var tenantInfo = new TenantInfo
        {
            Id = tenant.Id,
            Name = tenant.Name,
            ConnectionString = tenant.ConnectionString.Value,
            IsActive = tenant.IsActive
        };

        // Add to cache
        _cache.Set(cacheKey, tenantInfo, new MemoryCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromMinutes(5)
        });

        // Store in HttpContext.Items
        httpContext.Items[TenantIdKey] = tenantInfo.Id;
        httpContext.Items[TenantNameKey] = tenantInfo.Name;
        httpContext.Items[TenantConnectionStringKey] = tenantInfo.ConnectionString;

        _logger.LogInformation("Tenant {TenantId} ({TenantName}) set successfully", tenantInfo.Id, tenantInfo.Name);
        return true;
    }

    public async Task<bool> SetCurrentTenant(string tenantIdentifier)
    {
        if (string.IsNullOrWhiteSpace(tenantIdentifier))
        {
            _logger.LogWarning("Tenant identifier is null or empty");
            return false;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            _logger.LogWarning("Cannot set tenant - HttpContext is null");
            return false;
        }

        // Try to get from cache first
        var cacheKey = $"{TenantCacheKeyPrefix}Code:{tenantIdentifier}";
        var tenantInfo = await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.SlidingExpiration = TimeSpan.FromMinutes(5);
            
            var tenant = await _masterDbContext.Tenants
                .AsNoTracking()
                .Include(t => t.Domains)
                .FirstOrDefaultAsync(t => t.Code == tenantIdentifier || 
                                         t.Domains.Any(d => d.DomainName == tenantIdentifier));
                
            if (tenant == null || !tenant.IsActive)
                return null;
                
            return new TenantInfo
            {
                Id = tenant.Id,
                Name = tenant.Name,
                ConnectionString = tenant.ConnectionString.Value,
                IsActive = tenant.IsActive
            };
        });

        if (tenantInfo == null)
        {
            _logger.LogWarning("Tenant with identifier {TenantIdentifier} not found or inactive", tenantIdentifier);
            return false;
        }

        // Store in HttpContext.Items
        httpContext.Items[TenantIdKey] = tenantInfo.Id;
        httpContext.Items[TenantNameKey] = tenantInfo.Name;
        httpContext.Items[TenantConnectionStringKey] = tenantInfo.ConnectionString;

        _logger.LogInformation("Tenant {TenantId} ({TenantName}) set successfully via identifier {Identifier}", 
            tenantInfo.Id, tenantInfo.Name, tenantIdentifier);
        return true;
    }

    private Guid? ResolveTenantId(HttpContext httpContext)
    {
        // 1. Check X-Tenant-Code header first (most explicit for API requests)
        if (httpContext.Request.Headers.TryGetValue("X-Tenant-Code", out var tenantCodeHeader))
        {
            var tenantCode = tenantCodeHeader.ToString();
            if (!string.IsNullOrEmpty(tenantCode))
            {
                var tenant = _masterDbContext.Tenants
                    .AsNoTracking()
                    .FirstOrDefault(t => t.Code == tenantCode && t.IsActive);

                if (tenant != null)
                {
                    _logger.LogInformation("Tenant {TenantId} ({TenantCode}) resolved from X-Tenant-Code header", tenant.Id, tenantCode);
                    return tenant.Id;
                }
                else
                {
                    _logger.LogWarning("Tenant with code {TenantCode} not found or inactive in X-Tenant-Code header", tenantCode);
                }
            }
        }

        // 2. Check X-Tenant-Id header (for backward compatibility)
        if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdHeader))
        {
            if (Guid.TryParse(tenantIdHeader.ToString(), out var tenantId))
            {
                _logger.LogDebug("Tenant {TenantId} resolved from X-Tenant-Id header", tenantId);
                return tenantId;
            }
        }

        // 3. Check claims (from JWT) - Try TenantCode first, then TenantId
        var tenantCodeClaim = httpContext.User?.FindFirst("TenantCode");
        if (tenantCodeClaim != null && !string.IsNullOrEmpty(tenantCodeClaim.Value))
        {
            var tenant = _masterDbContext.Tenants
                .AsNoTracking()
                .FirstOrDefault(t => t.Code == tenantCodeClaim.Value && t.IsActive);

            if (tenant != null)
            {
                _logger.LogDebug("Tenant {TenantId} ({TenantCode}) resolved from TenantCode claim", tenant.Id, tenantCodeClaim.Value);
                return tenant.Id;
            }
        }

        var tenantClaim = httpContext.User?.FindFirst("TenantId");
        if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var claimTenantId))
        {
            _logger.LogDebug("Tenant {TenantId} resolved from TenantId claim", claimTenantId);
            return claimTenantId;
        }

        // 4. Check subdomain
        var host = httpContext.Request.Host.Host;
        var subdomain = ExtractSubdomain(host);
        if (!string.IsNullOrEmpty(subdomain))
        {
            // First try tenant Code (subdomain usually matches tenant code)
            var tenantByCode = _masterDbContext.Tenants
                .AsNoTracking()
                .FirstOrDefault(t => t.Code == subdomain && t.IsActive);

            if (tenantByCode != null)
            {
                _logger.LogInformation("Tenant {TenantId} ({TenantCode}) resolved from subdomain matching tenant code", tenantByCode.Id, subdomain);
                return tenantByCode.Id;
            }

            // Fallback: Check Domains table
            var tenantByDomain = _masterDbContext.Tenants
                .AsNoTracking()
                .Include(t => t.Domains)
                .FirstOrDefault(t => t.Domains.Any(d => d.DomainName == subdomain) && t.IsActive);

            if (tenantByDomain != null)
            {
                _logger.LogDebug("Tenant {TenantId} resolved from subdomain via Domains table", tenantByDomain.Id);
                return tenantByDomain.Id;
            }

            _logger.LogWarning("Subdomain {Subdomain} found but no matching tenant in Code or Domains", subdomain);
        }

        _logger.LogDebug("No tenant could be resolved from request");
        return null;
    }

    private void LoadTenantInfo(Guid tenantId, HttpContext httpContext)
    {
        var cacheKey = $"{TenantCacheKeyPrefix}{tenantId}";
        var tenantInfo = _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.SlidingExpiration = TimeSpan.FromMinutes(5);
            
            var tenant = _masterDbContext.Tenants
                .AsNoTracking()
                .FirstOrDefault(t => t.Id == tenantId);
                
            if (tenant == null)
                return null;
                
            return new TenantInfo
            {
                Id = tenant.Id,
                Name = tenant.Name,
                ConnectionString = tenant.ConnectionString.Value,
                IsActive = tenant.IsActive
            };
        });

        if (tenantInfo != null)
        {
            httpContext.Items[TenantNameKey] = tenantInfo.Name;
            httpContext.Items[TenantConnectionStringKey] = tenantInfo.ConnectionString;
        }
    }

    private string? ExtractSubdomain(string host)
    {
        if (string.IsNullOrEmpty(host))
            return null;

        // Handle localhost and IP addresses
        if (host.StartsWith("localhost", StringComparison.OrdinalIgnoreCase) || 
            host.StartsWith("127.0.0.1") ||
            host.StartsWith("[::1]") ||
            System.Net.IPAddress.TryParse(host, out _))
        {
            return null;
        }

        var parts = host.Split('.');
        if (parts.Length >= 3)
        {
            // Extract subdomain (e.g., "tenant1" from "tenant1.example.com")
            return parts[0];
        }

        return null;
    }

    /// <summary>
    /// Internal class to hold cached tenant information
    /// </summary>
    private class TenantInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ConnectionString { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}