using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Stocker.Infrastructure.Middleware.Security;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly SecurityHeadersOptions _options;

    public SecurityHeadersMiddleware(RequestDelegate next, IOptions<SecurityHeadersOptions> options)
    {
        _next = next;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add security headers before processing the request
        AddSecurityHeaders(context);

        await _next(context);
    }

    private void AddSecurityHeaders(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Prevent MIME type sniffing
        if (_options.AddXContentTypeOptions)
        {
            headers["X-Content-Type-Options"] = "nosniff";
        }

        // Prevent clickjacking attacks
        if (_options.AddXFrameOptions)
        {
            headers["X-Frame-Options"] = _options.XFrameOptions;
        }

        // Enable XSS protection (for older browsers)
        if (_options.AddXXssProtection)
        {
            headers["X-XSS-Protection"] = "1; mode=block";
        }

        // Control referrer information
        if (_options.AddReferrerPolicy)
        {
            headers["Referrer-Policy"] = _options.ReferrerPolicy;
        }

        // Content Security Policy
        if (_options.AddContentSecurityPolicy && !string.IsNullOrEmpty(_options.ContentSecurityPolicy))
        {
            headers["Content-Security-Policy"] = _options.ContentSecurityPolicy;
        }

        // Strict Transport Security (HSTS)
        if (_options.AddStrictTransportSecurity && context.Request.IsHttps)
        {
            headers["Strict-Transport-Security"] = _options.StrictTransportSecurity;
        }

        // Permissions Policy (formerly Feature Policy)
        if (_options.AddPermissionsPolicy && !string.IsNullOrEmpty(_options.PermissionsPolicy))
        {
            headers["Permissions-Policy"] = _options.PermissionsPolicy;
        }

        // Remove server header
        if (_options.RemoveServerHeader)
        {
            headers.Remove("Server");
        }

        // Remove X-Powered-By header
        if (_options.RemoveXPoweredByHeader)
        {
            headers.Remove("X-Powered-By");
        }

        // Custom headers
        foreach (var customHeader in _options.CustomHeaders)
        {
            headers[customHeader.Key] = customHeader.Value;
        }
    }
}

public class SecurityHeadersOptions
{
    public bool AddXContentTypeOptions { get; set; } = true;
    
    public bool AddXFrameOptions { get; set; } = true;
    public string XFrameOptions { get; set; } = "DENY"; // DENY, SAMEORIGIN, ALLOW-FROM uri
    
    public bool AddXXssProtection { get; set; } = true;
    
    public bool AddReferrerPolicy { get; set; } = true;
    public string ReferrerPolicy { get; set; } = "strict-origin-when-cross-origin";
    
    public bool AddContentSecurityPolicy { get; set; } = true;
    public string ContentSecurityPolicy { get; set; } = "default-src 'self'; " +
                                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                                                        "style-src 'self' 'unsafe-inline'; " +
                                                        "img-src 'self' data: https:; " +
                                                        "font-src 'self' data:; " +
                                                        "connect-src 'self' wss: https:; " +
                                                        "frame-ancestors 'none'; " +
                                                        "base-uri 'self'; " +
                                                        "form-action 'self'";
    
    public bool AddStrictTransportSecurity { get; set; } = true;
    public string StrictTransportSecurity { get; set; } = "max-age=31536000; includeSubDomains; preload";
    
    public bool AddPermissionsPolicy { get; set; } = true;
    public string PermissionsPolicy { get; set; } = "accelerometer=(), " +
                                                     "camera=(), " +
                                                     "geolocation=(), " +
                                                     "gyroscope=(), " +
                                                     "magnetometer=(), " +
                                                     "microphone=(), " +
                                                     "payment=(), " +
                                                     "usb=()";
    
    public bool RemoveServerHeader { get; set; } = true;
    public bool RemoveXPoweredByHeader { get; set; } = true;
    
    public Dictionary<string, string> CustomHeaders { get; set; } = new();
}

public static class SecurityHeadersExtensions
{
    public static IServiceCollection AddSecurityHeaders(
        this IServiceCollection services, 
        Action<SecurityHeadersOptions>? configureOptions = null)
    {
        services.Configure<SecurityHeadersOptions>(options =>
        {
            configureOptions?.Invoke(options);
        });
        
        return services;
    }

    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }

    public static IApplicationBuilder UseSecurityHeaders(
        this IApplicationBuilder app, 
        Action<SecurityHeadersOptions> configureOptions)
    {
        var options = new SecurityHeadersOptions();
        configureOptions(options);
        
        return app.UseMiddleware<SecurityHeadersMiddleware>(Options.Create(options));
    }
}