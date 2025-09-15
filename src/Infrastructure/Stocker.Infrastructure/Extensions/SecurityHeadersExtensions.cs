using Microsoft.AspNetCore.Builder;
using Stocker.Infrastructure.Middleware;

namespace Stocker.Infrastructure.Extensions;

public static class SecurityHeadersExtensions
{
    /// <summary>
    /// Adds security headers middleware to the pipeline
    /// </summary>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }
}