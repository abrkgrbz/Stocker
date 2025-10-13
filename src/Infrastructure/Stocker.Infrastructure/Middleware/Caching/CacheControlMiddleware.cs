using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.Middleware.Caching;

/// <summary>
/// Middleware for managing Cache-Control headers
/// </summary>
public class CacheControlMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CacheControlMiddleware> _logger;
    private readonly CacheControlOptions _options;

    public CacheControlMiddleware(
        RequestDelegate next,
        ILogger<CacheControlMiddleware> logger,
        IOptions<CacheControlOptions> options)
    {
        _next = next;
        _logger = logger;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Process the request
        await _next(context);

        // Apply cache headers after response is generated
        ApplyCacheHeaders(context);
    }

    private void ApplyCacheHeaders(HttpContext context)
    {
        var request = context.Request;
        var response = context.Response;

        // Skip if response has already started
        if (response.HasStarted)
        {
            return;
        }

        // Skip if already has Cache-Control header
        if (response.Headers.ContainsKey(HeaderNames.CacheControl))
        {
            return;
        }

        // Determine cache policy based on endpoint
        var cachePolicy = GetCachePolicyForEndpoint(request.Path, request.Method);

        if (cachePolicy != null)
        {
            try
            {
                // Double-check before setting headers (race condition protection)
                if (response.HasStarted)
                {
                    _logger.LogDebug("Response already started. Skipping cache headers for {Path}", request.Path);
                    return;
                }

                // Set Cache-Control header
                response.Headers[HeaderNames.CacheControl] = cachePolicy.CacheControl;

                // Set Vary header if needed
                if (!string.IsNullOrEmpty(cachePolicy.Vary))
                {
                    response.Headers[HeaderNames.Vary] = cachePolicy.Vary;
                }

                // Set Expires header if max-age is specified
                if (cachePolicy.MaxAge.HasValue)
                {
                    var expires = DateTimeOffset.UtcNow.AddSeconds(cachePolicy.MaxAge.Value);
                    response.Headers[HeaderNames.Expires] = expires.ToString("R");
                }

                // Add Last-Modified header
                if (cachePolicy.AddLastModified)
                {
                    response.Headers[HeaderNames.LastModified] = DateTimeOffset.UtcNow.ToString("R");
                }

                _logger.LogDebug("Applied cache policy: {CacheControl} to {Path}",
                    cachePolicy.CacheControl, request.Path);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("read-only") || ex.Message.Contains("already started"))
            {
                // Response started between check and header setting - log and continue
                _logger.LogDebug(ex, "Could not set cache headers for {Path} - response already started", request.Path);
            }
        }
    }

    private CachePolicy? GetCachePolicyForEndpoint(string path, string method)
    {
        // Only cache GET and HEAD requests by default
        if (method != HttpMethods.Get && method != HttpMethods.Head)
        {
            return new CachePolicy
            {
                CacheControl = "no-cache, no-store, must-revalidate",
                MaxAge = 0
            };
        }

        // Check for specific endpoint policies
        foreach (var policy in _options.EndpointPolicies)
        {
            if (path.StartsWith(policy.Key, StringComparison.OrdinalIgnoreCase))
            {
                return policy.Value;
            }
        }

        // Apply default policy
        return _options.DefaultPolicy;
    }
}

/// <summary>
/// Options for cache control configuration
/// </summary>
public class CacheControlOptions
{
    /// <summary>
    /// Default cache policy for all endpoints
    /// </summary>
    public CachePolicy DefaultPolicy { get; set; } = new CachePolicy
    {
        CacheControl = "private, max-age=0, must-revalidate",
        MaxAge = 0
    };

    /// <summary>
    /// Specific cache policies for different endpoints
    /// </summary>
    public Dictionary<string, CachePolicy> EndpointPolicies { get; set; } = new()
    {
        // Static content
        ["/static"] = new CachePolicy
        {
            CacheControl = "public, max-age=31536000, immutable",
            MaxAge = 31536000 // 1 year
        },

        // API responses
        ["/api"] = new CachePolicy
        {
            CacheControl = "private, max-age=60, must-revalidate",
            MaxAge = 60,
            Vary = "Accept, Accept-Encoding, Authorization"
        },

        // Public data that rarely changes
        ["/api/public"] = new CachePolicy
        {
            CacheControl = "public, max-age=3600, s-maxage=7200",
            MaxAge = 3600, // 1 hour client cache
            Vary = "Accept, Accept-Encoding"
        },

        // User-specific data
        ["/api/user"] = new CachePolicy
        {
            CacheControl = "private, no-cache",
            MaxAge = 0,
            Vary = "Authorization"
        },

        // Admin endpoints - no caching
        ["/api/admin"] = new CachePolicy
        {
            CacheControl = "no-store, no-cache, must-revalidate",
            MaxAge = 0
        }
    };
}

/// <summary>
/// Represents a cache policy for an endpoint
/// </summary>
public class CachePolicy
{
    /// <summary>
    /// Cache-Control header value
    /// </summary>
    public string CacheControl { get; set; } = "no-cache";

    /// <summary>
    /// Max age in seconds
    /// </summary>
    public int? MaxAge { get; set; }

    /// <summary>
    /// Vary header value
    /// </summary>
    public string? Vary { get; set; }

    /// <summary>
    /// Whether to add Last-Modified header
    /// </summary>
    public bool AddLastModified { get; set; } = false;
}