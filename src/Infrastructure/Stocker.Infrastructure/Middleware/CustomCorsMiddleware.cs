using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.Middleware
{
    public class CustomCorsMiddleware
    {
        private readonly RequestDelegate _next;

        public CustomCorsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            
            // Check if origin is from *.stoocker.app
            if (!string.IsNullOrEmpty(origin))
            {
                var uri = new Uri(origin);
                if (uri.Host.EndsWith(".stoocker.app") || 
                    uri.Host == "stoocker.app" || 
                    uri.Host == "www.stoocker.app" ||
                    uri.Host.Contains("localhost") ||
                    uri.Host.Contains("127.0.0.1"))
                {
                    // Add CORS headers
                    context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
                    context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
                    context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
                    context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With, X-Tenant-Code, X-Tenant-Id, X-Tenant-Subdomain");
                    context.Response.Headers.Add("Access-Control-Max-Age", "3600");
                    context.Response.Headers.Add("Access-Control-Expose-Headers", "*");
                }
            }

            // Handle preflight requests
            if (context.Request.Method == "OPTIONS")
            {
                context.Response.StatusCode = 200;
                return;
            }

            await _next(context);
        }
    }
}