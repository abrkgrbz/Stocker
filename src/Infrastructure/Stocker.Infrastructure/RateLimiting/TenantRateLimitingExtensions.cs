using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace Stocker.Infrastructure.RateLimiting;

/// <summary>
/// Extension methods for configuring tenant rate limiting
/// </summary>
public static class TenantRateLimitingExtensions
{
    /// <summary>
    /// Adds tenant rate limiting services to the DI container
    /// </summary>
    public static IServiceCollection AddTenantRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        // Add memory cache for storing rate limiters
        services.AddMemoryCache();
        
        // Configure rate limiting options
        services.Configure<TenantRateLimitingOptions>(configuration.GetSection("TenantRateLimiting"));
        
        return services;
    }

    /// <summary>
    /// Adds the tenant rate limiting middleware to the application pipeline
    /// </summary>
    public static IApplicationBuilder UseTenantRateLimiting(this IApplicationBuilder app)
    {
        return app.UseMiddleware<TenantRateLimitingMiddleware>();
    }
}