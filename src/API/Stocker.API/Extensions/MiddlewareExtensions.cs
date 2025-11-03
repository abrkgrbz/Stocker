using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Stocker.SignalR.Hubs;
using Stocker.Infrastructure.Middleware;
using Stocker.Infrastructure.Middleware.ErrorHandling;
using Stocker.Infrastructure.Middleware.RateLimiting;

using Stocker.Infrastructure.Middleware.Correlation;
using Stocker.Infrastructure.BackgroundJobs;
using Stocker.Infrastructure.RateLimiting;

namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring middleware pipeline
/// </summary>
public static class MiddlewareExtensions
{
    /// <summary>
    /// Configures the complete middleware pipeline for the application
    /// </summary>
    public static WebApplication UseApiPipeline(this WebApplication app, IConfiguration configuration)
    {
        var environment = app.Environment;
        
        // Get API Version Description Provider for Swagger
        var apiVersionProvider = app.Services.GetService<IApiVersionDescriptionProvider>();

        // 1. Swagger (Development only)
        if (environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                // Add versioned API documentation
                if (apiVersionProvider != null)
                {
                    foreach (var description in apiVersionProvider.ApiVersionDescriptions)
                    {
                        c.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json", 
                            $"Stocker API {description.GroupName.ToUpperInvariant()}");
                    }
                }
                else
                {
                    // Fallback to existing endpoints
                    c.SwaggerEndpoint("/swagger/master/swagger.json", "Master API");
                    c.SwaggerEndpoint("/swagger/tenant/swagger.json", "Tenant API");
                    c.SwaggerEndpoint("/swagger/crm/swagger.json", "CRM Module");
                    c.SwaggerEndpoint("/swagger/public/swagger.json", "Public API");
                    c.SwaggerEndpoint("/swagger/admin/swagger.json", "Admin API");
                }
                
                c.RoutePrefix = string.Empty; // Swagger UI at root
                c.DocumentTitle = "Stocker API Documentation";
            });
            app.Logger.LogInformation("Swagger UI is enabled for Development environment");
        }
        else
        {
            app.Logger.LogInformation("Swagger UI is disabled in Production for security");
        }

        // 2. Routing (Must be before CORS for endpoint-based CORS)
        app.UseRouting();

        // 3. CORS - Environment based policy (Must be after UseRouting, before UseEndpoints)
        var corsPolicy = environment.IsDevelopment() ? "Development" : "Production";
        app.UseCors(corsPolicy);
        app.Logger.LogInformation($"CORS policy '{corsPolicy}' has been applied for {environment.EnvironmentName} environment");

        // 4. WebSockets for SignalR
        var allowedOrigins = configuration.GetSection("WebSocketOptions:AllowedOrigins").Get<string[]>()
            ?? new[] {
                "https://stoocker.app",
                "https://www.stoocker.app",
                "https://auth.stoocker.app",  // Auth subdomain for 2FA
                "https://master.stoocker.app",
                "https://admin.stoocker.app"
            };

        var webSocketOptions = new Microsoft.AspNetCore.Builder.WebSocketOptions
        {
            KeepAliveInterval = TimeSpan.FromSeconds(30),
            ReceiveBufferSize = 4 * 1024 // 4KB
        };

        foreach (var origin in allowedOrigins)
        {
            webSocketOptions.AllowedOrigins.Add(origin);
        }

        app.UseWebSockets(webSocketOptions);

        // 5. Correlation ID (Must be early in pipeline)
        app.UseCorrelationId();

        // 6. Response Compression
        app.UseResponseCompression();

        // 7. Global Exception Handling
        app.UseGlobalErrorHandling();

        // 8. Request Logging (Serilog)
        Configuration.SerilogConfiguration.ConfigureRequestLogging(app);

        // 9. Request Localization
        app.UseRequestLocalization();

        // 10. HTTPS Redirect (Production only)
        if (!environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // 11. Security Headers (Skip for SignalR hubs and Swagger)
        app.UseWhen(
            context => !context.Request.Path.StartsWithSegments("/hubs") &&
                      !context.Request.Path.StartsWithSegments("/swagger"),
            appBuilder => Stocker.Infrastructure.Middleware.SecurityHeadersExtensions.UseSecurityHeaders(appBuilder));

        // 12. Tenant Resolution (Before authentication)
        app.UseMiddleware<TenantResolutionMiddleware>();

        // 13. Authentication & Authorization
        app.UseAuthentication();
        app.UseAuthorization();
        
        // 13.5 Module Authorization (Check tenant subscriptions)
        app.UseMiddleware<Stocker.API.Middleware.ModuleAuthorizationMiddleware>();

        // 14. Caching Middleware (Phase 2)
        // Response caching before rate limiting for better performance
        app.UseMiddleware<Stocker.Infrastructure.Middleware.Caching.ResponseCachingMiddleware>();

        // ETag support for conditional requests
        app.UseMiddleware<Stocker.Infrastructure.Middleware.Caching.ETagMiddleware>();

        // Cache-Control headers
        app.UseMiddleware<Stocker.Infrastructure.Middleware.Caching.CacheControlMiddleware>();

        // 15. Rate Limiting (After auth for user-based limits)
        app.UseRateLimiting();

        // 16. Tenant-based Rate Limiting (Additional layer)
        app.UseTenantRateLimiting();

        // 17. Static Files with MIME types
        app.UseStaticFiles(new StaticFileOptions
        {
            ContentTypeProvider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider
            {
                Mappings =
                {
                    [".js"] = "application/javascript",
                    [".mjs"] = "application/javascript",
                    [".css"] = "text/css",
                    [".json"] = "application/json",
                    [".html"] = "text/html",
                    [".svg"] = "image/svg+xml",
                    [".png"] = "image/png",
                    [".jpg"] = "image/jpeg",
                    [".jpeg"] = "image/jpeg",
                    [".gif"] = "image/gif",
                    [".ico"] = "image/x-icon",
                    [".woff"] = "font/woff",
                    [".woff2"] = "font/woff2",
                    [".ttf"] = "font/ttf",
                    [".eot"] = "application/vnd.ms-fontobject",
                    [".otf"] = "font/otf"
                }
            },
            OnPrepareResponse = ctx =>
            {
                ctx.Context.Response.Headers.Add("X-Content-Type-Options", "nosniff");

                if (ctx.File.Name.EndsWith(".js") || ctx.File.Name.EndsWith(".css") || ctx.File.Name.EndsWith(".mjs"))
                {
                    ctx.Context.Response.Headers.Add("Cache-Control", "public, max-age=31536000, immutable");
                }
            }
        });

        // 18. Hangfire (Skip in Testing environment)
        if (!environment.EnvironmentName.Equals("Testing", StringComparison.OrdinalIgnoreCase))
        {
            var jwtSecret = configuration["JwtSettings:Secret"];
            var jwtIssuer = configuration["JwtSettings:Issuer"] ?? "Stocker";
            var jwtAudience = configuration["JwtSettings:Audience"] ?? "Stocker";

            app.UseMiddleware<HangfireAuthMiddleware>(jwtSecret, jwtIssuer, jwtAudience);
            app.UseHangfireDashboard(configuration);
        }

        // 19. Map Controllers and Endpoints
        app.MapControllers();

        // 20. SignalR Hubs
        app.MapHub<ValidationHub>("/hubs/validation", options =>
        {
            options.Transports = HttpTransportType.WebSockets |
                                 HttpTransportType.ServerSentEvents |
                                 HttpTransportType.LongPolling;
        })
        .RequireCors(corsPolicy)
        .RequireAuthorization(); // ✅ Authentication required

        app.MapHub<NotificationHub>("/hubs/notification", options =>
        {
            options.Transports = HttpTransportType.WebSockets |
                                 HttpTransportType.ServerSentEvents |
                                 HttpTransportType.LongPolling;
        })
        .RequireCors(corsPolicy)
        .RequireAuthorization(); // ✅ Authentication required

        app.MapHub<ChatHub>("/hubs/chat", options =>
        {
            options.Transports = HttpTransportType.WebSockets |
                                 HttpTransportType.ServerSentEvents |
                                 HttpTransportType.LongPolling;
        })
        .RequireCors(corsPolicy)
        .RequireAuthorization(); // ✅ Authentication required

        // 21. Health Check Endpoints
        app.MapGet("/health/signalr", () => Results.Ok(new { status = "Healthy", service = "SignalR" }))
           .WithName("SignalRHealthCheck")
           .WithTags("Health");

        return app;
    }
}
