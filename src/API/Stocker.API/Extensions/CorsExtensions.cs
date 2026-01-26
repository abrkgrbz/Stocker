namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring CORS policies
/// </summary>
public static class CorsExtensions
{
    /// <summary>
    /// Adds environment-specific CORS policies (Development and Production)
    /// </summary>
    public static IServiceCollection AddCorsPolicies(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        services.AddCors(options =>
        {
            // Development policy - More permissive for local testing
            options.AddPolicy("Development", policy =>
            {
                policy.SetIsOriginAllowed(origin =>
                    {
                        if (string.IsNullOrEmpty(origin))
                            return false;

                        try
                        {
                            var uri = new Uri(origin);
                            // Allow localhost
                            return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                        }
                        catch
                        {
                            return false;
                        }
                    })
                      .AllowAnyMethod()
                      .WithHeaders(
                          "Content-Type", "Authorization", "Accept",
                          "X-Request-ID", "X-Tenant-Code", "X-Tenant-Id", "X-Correlation-ID",
                          "Cache-Control", "Pragma",
                          "X-Requested-With", "X-SignalR-User-Agent" // SignalR headers
                      )
                      .AllowCredentials()
                      .WithExposedHeaders(
                          "Content-Disposition",
                          "X-Total-Count",
                          "X-Page-Number",
                          "X-Page-Size",
                          "X-Total-Pages",
                          "X-Has-Previous-Page",
                          "X-Has-Next-Page"
                      );
            });

            // Production policy - Allow stoocker.app subdomains and localhost for development
            options.AddPolicy("Production", policy =>
            {
                policy.SetIsOriginAllowed(origin =>
                {
                    if (string.IsNullOrEmpty(origin))
                        return false;

                    try
                    {
                        var uri = new Uri(origin);
                        // Allow stoocker.app domains
                        if (uri.Host.EndsWith(".stoocker.app") ||
                            uri.Host == "stoocker.app" ||
                            uri.Host == "www.stoocker.app")
                            return true;

                        // Allow localhost for local development against production API
                        if (uri.Host == "localhost" || uri.Host == "127.0.0.1")
                            return true;

                        return false;
                    }
                    catch
                    {
                        return false;
                    }
                })
                .AllowAnyMethod()
                .WithHeaders(
                    "Content-Type", "Authorization", "Accept",
                    "X-Request-ID", "X-Tenant-Code", "X-Tenant-Id", "X-Correlation-ID",
                    "Cache-Control", "Pragma",
                    "X-Requested-With", "X-SignalR-User-Agent" // SignalR headers
                )
                .AllowCredentials()
                .WithExposedHeaders(
                    "Content-Disposition",
                    "X-Total-Count",
                    "X-Page-Number",
                    "X-Page-Size",
                    "X-Total-Pages",
                    "X-Has-Previous-Page",
                    "X-Has-Next-Page"
                );
            });
        });

        return services;
    }
}

