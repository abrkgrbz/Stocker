using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.Middleware.Caching;

/// <summary>
/// Middleware for caching HTTP responses
/// </summary>
public class ResponseCachingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IDistributedCache _cache;
    private readonly ILogger<ResponseCachingMiddleware> _logger;
    private readonly ResponseCachingOptions _options;

    public ResponseCachingMiddleware(
        RequestDelegate next,
        IDistributedCache cache,
        ILogger<ResponseCachingMiddleware> logger,
        IOptions<ResponseCachingOptions> options)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only cache GET and HEAD requests
        if (!IsCacheableMethod(context.Request.Method))
        {
            await _next(context);
            return;
        }

        // Check if endpoint should be cached
        if (!ShouldCache(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Generate cache key
        var cacheKey = GenerateCacheKey(context.Request);

        // Try to get from cache
        var cachedResponse = await _cache.GetAsync(cacheKey);
        if (cachedResponse != null)
        {
            await ServeFromCache(context, cachedResponse);
            return;
        }

        // Capture response for caching
        var originalBodyStream = context.Response.Body;

        try
        {
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            await _next(context);

            // Only cache successful responses
            if (IsCacheableResponse(context.Response))
            {
                await CacheResponse(cacheKey, context.Response, responseBody);
            }

            // Copy response to original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private bool IsCacheableMethod(string method)
    {
        return method == HttpMethods.Get || method == HttpMethods.Head;
    }

    private bool ShouldCache(PathString path)
    {
        // Check excluded paths
        foreach (var excludedPath in _options.ExcludedPaths)
        {
            if (path.StartsWithSegments(excludedPath))
            {
                return false;
            }
        }

        // Check included paths
        if (_options.IncludedPaths.Count == 0)
        {
            return true; // Cache all by default if no includes specified
        }

        foreach (var includedPath in _options.IncludedPaths)
        {
            if (path.StartsWithSegments(includedPath))
            {
                return true;
            }
        }

        return false;
    }

    private bool IsCacheableResponse(HttpResponse response)
    {
        // Only cache successful responses
        if (response.StatusCode < 200 || response.StatusCode >= 300)
        {
            return false;
        }

        // Check for no-store directive
        if (response.Headers.CacheControl.ToString().Contains("no-store"))
        {
            return false;
        }

        return true;
    }

    private string GenerateCacheKey(HttpRequest request)
    {
        var keyBuilder = new StringBuilder();
        keyBuilder.Append(_options.CacheKeyPrefix);
        keyBuilder.Append(request.Path);
        keyBuilder.Append(request.QueryString);

        // Include headers in cache key if specified
        foreach (var header in _options.VaryByHeaders)
        {
            if (request.Headers.TryGetValue(header, out var value))
            {
                keyBuilder.Append($":{header}={value}");
            }
        }

        // Include user identity if vary by user
        if (_options.VaryByUser && request.HttpContext.User?.Identity?.IsAuthenticated == true)
        {
            keyBuilder.Append($":user={request.HttpContext.User.Identity.Name}");
        }

        // Hash the key for consistent length
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(keyBuilder.ToString()));
        return Convert.ToBase64String(hashBytes);
    }

    private async Task CacheResponse(string cacheKey, HttpResponse response, MemoryStream responseBody)
    {
        var cachedResponse = new CachedResponse
        {
            StatusCode = response.StatusCode,
            Headers = new Dictionary<string, string>(),
            Body = responseBody.ToArray(),
            CachedAt = DateTimeOffset.UtcNow
        };

        // Cache relevant headers
        foreach (var header in response.Headers)
        {
            if (_options.CacheableHeaders.Contains(header.Key))
            {
                cachedResponse.Headers[header.Key] = header.Value.ToString();
            }
        }

        var json = JsonSerializer.Serialize(cachedResponse);
        var cacheEntryOptions = new DistributedCacheEntryOptions
        {
            SlidingExpiration = TimeSpan.FromSeconds(_options.DefaultCacheDurationSeconds),
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_options.MaxCacheDurationSeconds)
        };

        await _cache.SetStringAsync(cacheKey, json, cacheEntryOptions);

        _logger.LogDebug("Cached response for key: {CacheKey}", cacheKey);
    }

    private async Task ServeFromCache(HttpContext context, byte[] cachedData)
    {
        var json = Encoding.UTF8.GetString(cachedData);
        var cachedResponse = JsonSerializer.Deserialize<CachedResponse>(json);

        if (cachedResponse == null)
        {
            await _next(context);
            return;
        }

        // Set status code
        context.Response.StatusCode = cachedResponse.StatusCode;

        // Set headers
        foreach (var header in cachedResponse.Headers)
        {
            context.Response.Headers[header.Key] = header.Value;
        }

        // Add cache headers
        context.Response.Headers["X-Cache"] = "HIT";
        context.Response.Headers["X-Cache-Age"] =
            ((int)(DateTimeOffset.UtcNow - cachedResponse.CachedAt).TotalSeconds).ToString();

        // Write body
        await context.Response.Body.WriteAsync(cachedResponse.Body);

        _logger.LogDebug("Served response from cache");
    }

    private class CachedResponse
    {
        public int StatusCode { get; set; }
        public Dictionary<string, string> Headers { get; set; } = new();
        public byte[] Body { get; set; } = Array.Empty<byte>();
        public DateTimeOffset CachedAt { get; set; }
    }
}

/// <summary>
/// Options for response caching middleware
/// </summary>
public class ResponseCachingOptions
{
    /// <summary>
    /// Cache key prefix
    /// </summary>
    public string CacheKeyPrefix { get; set; } = "response_cache:";

    /// <summary>
    /// Default cache duration in seconds
    /// </summary>
    public int DefaultCacheDurationSeconds { get; set; } = 60;

    /// <summary>
    /// Maximum cache duration in seconds
    /// </summary>
    public int MaxCacheDurationSeconds { get; set; } = 3600;

    /// <summary>
    /// Paths to exclude from caching
    /// </summary>
    public List<string> ExcludedPaths { get; set; } = new()
    {
        "/api/auth",
        "/api/user",
        "/api/admin",
        "/health",
        "/swagger"
    };

    /// <summary>
    /// Paths to include in caching (empty means all)
    /// </summary>
    public List<string> IncludedPaths { get; set; } = new()
    {
        "/api"
    };

    /// <summary>
    /// Headers to vary cache by
    /// </summary>
    public List<string> VaryByHeaders { get; set; } = new()
    {
        "Accept",
        "Accept-Encoding",
        "Accept-Language"
    };

    /// <summary>
    /// Whether to vary cache by user
    /// </summary>
    public bool VaryByUser { get; set; } = false;

    /// <summary>
    /// Headers to cache
    /// </summary>
    public List<string> CacheableHeaders { get; set; } = new()
    {
        "Content-Type",
        "Content-Encoding",
        "Content-Language"
    };
}