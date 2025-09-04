using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace Stocker.Infrastructure.Middleware;

/// <summary>
/// Extension methods for configuring security headers middleware
/// </summary>
public static class SecurityHeadersExtensions
{
    /// <summary>
    /// Adds the security headers middleware to the application pipeline
    /// </summary>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }

    /// <summary>
    /// Adds security headers configuration to the services
    /// </summary>
    public static IServiceCollection AddSecurityHeaders(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure security headers options from configuration
        services.Configure<SecurityHeadersOptions>(configuration.GetSection("SecurityHeaders"));
        
        return services;
    }
}