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

        // Development ortamında her zaman izin ver
        if (httpContext.Request.Host.Host == "localhost" || 
            httpContext.Request.Host.Host == "127.0.0.1")
        {
            return true;
        }

        // TEMPORARY: Allow anonymous access for testing
        // TODO: Remove this after testing and uncomment the code below
        return true;

        // Production'da sadece SistemYoneticisi ve FirmaYoneticisi rollerine izin ver
        // return httpContext.User.Identity?.IsAuthenticated == true &&
        //        (httpContext.User.IsInRole("SistemYoneticisi") || 
        //         httpContext.User.IsInRole("FirmaYoneticisi"));
    }
}