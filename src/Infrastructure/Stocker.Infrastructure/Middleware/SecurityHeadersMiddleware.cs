using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.Middleware;

/// <summary>
/// Middleware to add security headers to HTTP responses
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;
    private readonly SecurityHeadersOptions _options;

    public SecurityHeadersMiddleware(
        RequestDelegate next,
        ILogger<SecurityHeadersMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _options = configuration.GetSection("SecurityHeaders").Get<SecurityHeadersOptions>() 
            ?? new SecurityHeadersOptions();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip security headers in Testing environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment != "Testing")
        {
            // Add security headers before processing the request
            AddSecurityHeaders(context);
        }

        // Call the next middleware in the pipeline
        await _next(context);
    }

    private void AddSecurityHeaders(HttpContext context)
    {
        var headers = context.Response.Headers;

        // X-Content-Type-Options: Prevent MIME type sniffing
        if (_options.AddXContentTypeOptions && !headers.ContainsKey("X-Content-Type-Options"))
        {
            headers.Append("X-Content-Type-Options", "nosniff");
        }

        // X-Frame-Options: Prevent clickjacking attacks
        if (_options.AddXFrameOptions && !headers.ContainsKey("X-Frame-Options"))
        {
            headers.Append("X-Frame-Options", _options.XFrameOptionsValue ?? "DENY");
        }

        // X-XSS-Protection: Enable XSS protection in older browsers
        if (_options.AddXXssProtection && !headers.ContainsKey("X-XSS-Protection"))
        {
            headers.Append("X-XSS-Protection", "1; mode=block");
        }

        // Referrer-Policy: Control referrer information
        if (_options.AddReferrerPolicy && !headers.ContainsKey("Referrer-Policy"))
        {
            headers.Append("Referrer-Policy", _options.ReferrerPolicyValue ?? "strict-origin-when-cross-origin");
        }

        // Content-Security-Policy: Prevent XSS, clickjacking, and other attacks
        if (_options.AddContentSecurityPolicy && !headers.ContainsKey("Content-Security-Policy"))
        {
            var csp = BuildContentSecurityPolicy();
            headers.Append("Content-Security-Policy", csp);
        }

        // Strict-Transport-Security: Enforce HTTPS
        if (_options.AddStrictTransportSecurity && 
            context.Request.IsHttps && 
            !headers.ContainsKey("Strict-Transport-Security"))
        {
            var hsts = $"max-age={_options.HstsMaxAge}";
            if (_options.HstsIncludeSubDomains)
            {
                hsts += "; includeSubDomains";
            }
            if (_options.HstsPreload)
            {
                hsts += "; preload";
            }
            headers.Append("Strict-Transport-Security", hsts);
        }

        // X-Permitted-Cross-Domain-Policies: Control Adobe Flash and PDF policies
        if (_options.AddXPermittedCrossDomainPolicies && !headers.ContainsKey("X-Permitted-Cross-Domain-Policies"))
        {
            headers.Append("X-Permitted-Cross-Domain-Policies", "none");
        }

        // Permissions-Policy: Control browser features and APIs
        if (_options.AddPermissionsPolicy && !headers.ContainsKey("Permissions-Policy"))
        {
            var permissionsPolicy = BuildPermissionsPolicy();
            headers.Append("Permissions-Policy", permissionsPolicy);
        }

        // Remove potentially dangerous headers
        RemoveDangerousHeaders(headers);

        _logger.LogDebug("Security headers added to response for {Path}", context.Request.Path);
    }

    private string BuildContentSecurityPolicy()
    {
        var policies = new List<string>
        {
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' wss: https:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        };

        if (!string.IsNullOrEmpty(_options.CustomContentSecurityPolicy))
        {
            return _options.CustomContentSecurityPolicy;
        }

        return string.Join("; ", policies);
    }

    private string BuildPermissionsPolicy()
    {
        var policies = new List<string>
        {
            "accelerometer=()",
            "camera=()",
            "geolocation=()",
            "gyroscope=()",
            "magnetometer=()",
            "microphone=()",
            "payment=()",
            "usb=()",
            "interest-cohort=()"
        };

        if (!string.IsNullOrEmpty(_options.CustomPermissionsPolicy))
        {
            return _options.CustomPermissionsPolicy;
        }

        return string.Join(", ", policies);
    }

    private void RemoveDangerousHeaders(IHeaderDictionary headers)
    {
        // Remove headers that might expose sensitive information
        headers.Remove("Server");
        headers.Remove("X-Powered-By");
        headers.Remove("X-AspNet-Version");
        headers.Remove("X-AspNetMvc-Version");
    }
}

/// <summary>
/// Configuration options for security headers
/// </summary>
public class SecurityHeadersOptions
{
    public bool AddXContentTypeOptions { get; set; } = true;
    public bool AddXFrameOptions { get; set; } = true;
    public string? XFrameOptionsValue { get; set; } = "DENY";
    public bool AddXXssProtection { get; set; } = true;
    public bool AddReferrerPolicy { get; set; } = true;
    public string? ReferrerPolicyValue { get; set; } = "strict-origin-when-cross-origin";
    public bool AddContentSecurityPolicy { get; set; } = true;
    public string? CustomContentSecurityPolicy { get; set; }
    public bool AddStrictTransportSecurity { get; set; } = true;
    public int HstsMaxAge { get; set; } = 31536000; // 1 year in seconds
    public bool HstsIncludeSubDomains { get; set; } = true;
    public bool HstsPreload { get; set; } = false;
    public bool AddXPermittedCrossDomainPolicies { get; set; } = true;
    public bool AddPermissionsPolicy { get; set; } = true;
    public string? CustomPermissionsPolicy { get; set; }
}