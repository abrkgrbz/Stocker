using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.Middleware
{
    public class CustomCorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CustomCorsMiddleware> _logger;

        public CustomCorsMiddleware(RequestDelegate next, ILogger<CustomCorsMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            var path = context.Request.Path;
            var method = context.Request.Method;
            
            _logger.LogInformation($"CustomCorsMiddleware: Method={method}, Path={path}, Origin={origin}");
            
            // Handle preflight requests FIRST
            if (context.Request.Method == "OPTIONS")
            {
                _logger.LogInformation($"CustomCorsMiddleware: Handling OPTIONS request from {origin}");
                
                // Check if origin is from *.stoocker.app
                if (!string.IsNullOrEmpty(origin))
                {
                    try
                    {
                        var uri = new Uri(origin);
                        if (uri.Host.EndsWith(".stoocker.app") || 
                            uri.Host == "stoocker.app" || 
                            uri.Host == "www.stoocker.app" ||
                            uri.Host.Contains("localhost") ||
                            uri.Host.Contains("127.0.0.1"))
                        {
                            _logger.LogInformation($"CustomCorsMiddleware: Adding CORS headers for {origin}");
                            
                            // Add CORS headers for OPTIONS request
                            context.Response.Headers.Append("Access-Control-Allow-Origin", origin);
                            context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
                            context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
                            context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With, X-Tenant-Code, X-Tenant-Id, X-Tenant-Subdomain");
                            context.Response.Headers.Append("Access-Control-Max-Age", "3600");
                            context.Response.Headers.Append("Access-Control-Expose-Headers", "*");
                        }
                        else
                        {
                            _logger.LogWarning($"CustomCorsMiddleware: Origin {origin} not allowed");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"CustomCorsMiddleware: Error parsing origin {origin}");
                    }
                }
                else
                {
                    _logger.LogWarning("CustomCorsMiddleware: No origin header in OPTIONS request");
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