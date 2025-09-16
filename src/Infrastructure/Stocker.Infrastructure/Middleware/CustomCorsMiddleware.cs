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
            
            // Handle preflight requests FIRST
            if (context.Request.Method == "OPTIONS")
            {
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
                        // Add CORS headers for OPTIONS request
                        context.Response.Headers.Append("Access-Control-Allow-Origin", origin);
                        context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
                        context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
                        context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With, X-Tenant-Code, X-Tenant-Id, X-Tenant-Subdomain");
                        context.Response.Headers.Append("Access-Control-Max-Age", "3600");
                        context.Response.Headers.Append("Access-Control-Expose-Headers", "*");
                    }
                }
                
                context.Response.StatusCode = 200;
                await context.Response.WriteAsync(string.Empty);
                return;
            }

            // For non-OPTIONS requests, also add headers
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
                    context.Response.Headers.Append("Access-Control-Allow-Origin", origin);
                    context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
                    context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
                    context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With, X-Tenant-Code, X-Tenant-Id, X-Tenant-Subdomain");
                    context.Response.Headers.Append("Access-Control-Max-Age", "3600");
                    context.Response.Headers.Append("Access-Control-Expose-Headers", "*");
                }
            }

            await _next(context);
        }
    }
}