using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.MultiTenancy;
using System.Text.RegularExpressions;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Infrastructure.Middleware;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;

    public TenantResolutionMiddleware(RequestDelegate next, ILogger<TenantResolutionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip tenant resolution in Testing environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Testing")
        {
            _logger.LogDebug("Skipping tenant resolution in Testing environment");
            await _next(context);
            return;
        }
        
        // Skip tenant resolution for health check endpoints
        if (context.Request.Path.StartsWithSegments("/health") || 
            context.Request.Path.StartsWithSegments("/healthz") ||
            context.Request.Path.StartsWithSegments("/ready"))
        {
            await _next(context);
            return;
        }

        // Skip tenant resolution for public endpoints
        if (context.Request.Path.StartsWithSegments("/api/public") ||
            context.Request.Path.StartsWithSegments("/api/auth") ||
            context.Request.Path.StartsWithSegments("/api/master") ||
            context.Request.Path.StartsWithSegments("/api/admin") ||
            context.Request.Path.StartsWithSegments("/swagger") ||
            context.Request.Path.Value == "/" ||
            context.Request.Path.StartsWithSegments("/hangfire"))
        {
            _logger.LogDebug("Skipping tenant resolution for public/master endpoint: {Path}", context.Request.Path);
            await _next(context);
            return;
        }

        // Skip tenant resolution for SignalR hubs (they handle their own tenant resolution)
        if (context.Request.Path.StartsWithSegments("/hubs"))
        {
            _logger.LogDebug("Skipping tenant resolution for SignalR hub: {Path}", context.Request.Path);
            await _next(context);
            return;
        }

        var tenantService = context.RequestServices.GetRequiredService<ITenantService>();
        
        // Debug logging - gelen header'ları görelim
        _logger.LogDebug("Request Host: {Host}", context.Request.Host.Host);
        _logger.LogDebug("Request Headers: {Headers}", 
            string.Join(", ", context.Request.Headers.Select(h => $"{h.Key}={h.Value}")));
        
        // Try to resolve tenant from different sources
        var tenantId = await ResolveTenantAsync(context);
        
        if (tenantId.HasValue)
        {
            tenantService.SetCurrentTenant(tenantId.Value);
            _logger.LogInformation("Tenant resolved: {TenantId}", tenantId.Value);
            
            // Add tenant info to response headers for debugging
            context.Response.Headers.Add("X-Tenant-Id", tenantId.Value.ToString());
        }
        else
        {
            _logger.LogWarning("No tenant could be resolved for request to {Path}", context.Request.Path);
        }
        
        await _next(context);
    }

    private async Task<Guid?> ResolveTenantAsync(HttpContext context)
    {
        // 1. Try subdomain
        var tenantId = GetTenantFromSubdomain(context);
        if (tenantId.HasValue) return tenantId;

        // 2. Try custom domain
        tenantId = await GetTenantFromCustomDomain(context);
        if (tenantId.HasValue) return tenantId;

        // 3. Try header (for API calls)
        tenantId = GetTenantFromHeader(context);
        if (tenantId.HasValue) return tenantId;

        // 4. Try route
        tenantId = GetTenantFromRoute(context);
        if (tenantId.HasValue) return tenantId;

        // 5. Try query string
        tenantId = GetTenantFromQueryString(context);
        if (tenantId.HasValue) return tenantId;

        return null;
    }

    private Guid? GetTenantFromSubdomain(HttpContext context)
    {
        var host = context.Request.Host.Host;
        
        // Skip if localhost or IP
        if (host == "localhost" || Regex.IsMatch(host, @"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"))
            return null;

        // Extract subdomain (e.g., "tenant1" from "tenant1.stocker.com")
        var subdomain = host.Split('.')[0];
        
        // Skip common subdomains
        if (subdomain == "www" || subdomain == "api" || subdomain == "admin")
            return null;

        // Look up tenant by subdomain/code
        var tenantService = context.RequestServices.GetRequiredService<ITenantResolverService>();
        var tenantInfo = tenantService.GetTenantByCodeAsync(subdomain).Result;
        
        return tenantInfo?.Id;
    }

    private async Task<Guid?> GetTenantFromCustomDomain(HttpContext context)
    {
        var host = context.Request.Host.Host;
        
        // Look up tenant by custom domain
        var tenantService = context.RequestServices.GetRequiredService<ITenantResolverService>();
        var tenantInfo = await tenantService.GetTenantByDomainAsync(host);
        
        return tenantInfo?.Id;
    }

    private Guid? GetTenantFromHeader(HttpContext context)
    {
        // Check for tenant ID in header
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdString))
        {
            if (Guid.TryParse(tenantIdString, out var tenantId))
            {
                _logger.LogDebug("Tenant {TenantId} resolved from X-Tenant-Id header", tenantId);
                return tenantId;
            }
        }

        // Check for tenant code in header
        if (context.Request.Headers.TryGetValue("X-Tenant-Code", out var tenantCode))
        {
            var tenantService = context.RequestServices.GetRequiredService<ITenantResolverService>();
            var tenantInfo = tenantService.GetTenantByCodeAsync(tenantCode.ToString()).Result;
            if (tenantInfo != null)
            {
                _logger.LogDebug("Tenant {TenantId} resolved from X-Tenant-Code header: {TenantCode}", tenantInfo.Id, tenantCode);
                return tenantInfo.Id;
            }
        }

        return null;
    }

    private Guid? GetTenantFromRoute(HttpContext context)
    { 
        try
        { 
            if (context.Request.Path.HasValue && context.Request.Path.Value.Contains("/tenant/"))
            {
                var pathSegments = context.Request.Path.Value.Split('/');
                var tenantIndex = Array.IndexOf(pathSegments, "tenant");
                if (tenantIndex >= 0 && tenantIndex < pathSegments.Length - 1)
                {
                    if (Guid.TryParse(pathSegments[tenantIndex + 1], out var tenantId))
                    {
                        return tenantId;
                    }
                }
            } 
            if (context.Items.ContainsKey("tenantId"))
            {
                var tenantIdObj = context.Items["tenantId"];
                if (tenantIdObj != null && Guid.TryParse(tenantIdObj.ToString(), out var tenantId))
                {
                    return tenantId;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Error getting tenant from route");
        }

        return null;
    }

    private Guid? GetTenantFromQueryString(HttpContext context)
    {
        if (context.Request.Query.TryGetValue("tenantId", out var tenantIdString))
        {
            if (Guid.TryParse(tenantIdString, out var tenantId))
            {
                return tenantId;
            }
        }

        // Also check for tenant code in query string
        if (context.Request.Query.TryGetValue("tenant", out var tenantCode))
        {
            var tenantService = context.RequestServices.GetRequiredService<ITenantResolverService>();
            var tenantInfo = tenantService.GetTenantByCodeAsync(tenantCode.ToString()).Result;
            return tenantInfo?.Id;
        }

        return null;
    }
}

// Service for resolving tenants
public interface ITenantResolverService
{
    Task<TenantInfo?> GetTenantByCodeAsync(string code);
    Task<TenantInfo?> GetTenantByDomainAsync(string domain);
    Task<TenantInfo?> GetTenantByIdAsync(Guid id);
}

public class TenantInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public bool IsActive { get; set; }
}