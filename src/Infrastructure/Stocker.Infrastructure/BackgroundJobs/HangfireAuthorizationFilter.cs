using Hangfire.Annotations;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Stocker.Infrastructure.BackgroundJobs;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize([NotNull] DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // Check environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        var isDevelopment = environment == "Development";

        // In Development, still require authentication for localhost
        if (isDevelopment && 
            (httpContext.Request.Host.Host == "localhost" || 
             httpContext.Request.Host.Host == "127.0.0.1"))
        {
            // Require authentication even in development
            return httpContext.User.Identity?.IsAuthenticated == true;
        }

        // Production and all other cases: require authentication and proper roles
        return httpContext.User.Identity?.IsAuthenticated == true &&
               (httpContext.User.IsInRole("SistemYoneticisi") || 
                httpContext.User.IsInRole("FirmaYoneticisi") ||
                httpContext.User.IsInRole("Admin"));
    }
}