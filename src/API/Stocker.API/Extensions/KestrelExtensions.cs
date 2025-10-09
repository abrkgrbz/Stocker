namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring Kestrel web server
/// </summary>
public static class KestrelExtensions
{
    /// <summary>
    /// Configures Kestrel server limits for request handling
    /// </summary>
    public static IWebHostBuilder ConfigureKestrelServer(this IWebHostBuilder webHost)
    {
        webHost.ConfigureKestrel(serverOptions =>
        {
            // Maximum request body size (10MB)
            serverOptions.Limits.MaxRequestBodySize = 10 * 1024 * 1024;

            // Maximum number of headers per request
            serverOptions.Limits.MaxRequestHeaderCount = 100;

            // Maximum size of all request headers combined (32KB)
            serverOptions.Limits.MaxRequestHeadersTotalSize = 32 * 1024;

            // Maximum size of request line (8KB)
            serverOptions.Limits.MaxRequestLineSize = 8192;

            // Keep-alive timeout (2 minutes)
            serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);

            // Request headers timeout (30 seconds)
            serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);
        });

        return webHost;
    }
}
