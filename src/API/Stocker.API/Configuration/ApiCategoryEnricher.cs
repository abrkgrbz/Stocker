using Serilog.Core;
using Serilog.Events;
using Microsoft.AspNetCore.Http;

namespace Stocker.API.Configuration;

/// <summary>
/// Enricher that adds API categorization properties to all log events
/// </summary>
public class ApiCategoryEnricher : ILogEventEnricher
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ApiCategoryEnricher(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
            return;

        var path = httpContext.Request.Path.Value?.ToLower() ?? "";

        // Determine API category
        var apiCategory = path switch
        {
            var p when p.Contains("/api/master/") => "Master API",
            var p when p.Contains("/api/tenant/") => "Tenant API",
            var p when p.Contains("/api/crm/") => "CRM Module",
            var p when p.Contains("/api/public/") => "Public API",
            var p when p.Contains("/api/admin/") => "Admin API",
            var p when p.Contains("/api/auth") => "Authentication",
            var p when p.Contains("/hubs/") => "SignalR Hubs",
            var p when p.Contains("/health") => "Health Checks",
            var p when p.Contains("/swagger") => "Documentation",
            var p when p.Contains("/hangfire") => "Background Jobs",
            _ => "Other"
        };

        // Add ApiCategory property
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("ApiCategory", apiCategory));

        // Determine API module and resource
        if (path.Contains("/api/"))
        {
            var pathParts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (pathParts.Length >= 3)
            {
                var apiModule = pathParts[1]; // master, tenant, crm, etc.
                var apiResource = pathParts[2]; // users, products, invoices, etc.

                logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("ApiModule", apiModule));
                logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("ApiResource", apiResource));
            }
        }

        // Add HTTP method
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("HttpMethod", httpContext.Request.Method));

        // Add tenant ID if available
        var tenantId = httpContext.User?.FindFirst("TenantId")?.Value;
        if (!string.IsNullOrEmpty(tenantId))
        {
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("TenantId", tenantId));
        }

        // Add user ID if available
        var userId = httpContext.User?.FindFirst("UserId")?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("UserId", userId));
        }
    }
}
