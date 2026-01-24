using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Caching;

/// <summary>
/// ETag-based conditional response filter for inventory read endpoints.
/// Supports If-None-Match (GET) and If-Match (PUT/DELETE) headers.
/// Applied via TypeFilterAttribute pattern.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class InventoryCacheAttribute : TypeFilterAttribute
{
    public InventoryCacheAttribute(int maxAgeSeconds = 60)
        : base(typeof(InventoryCacheFilter))
    {
        Arguments = new object[] { maxAgeSeconds };
    }
}

/// <summary>
/// Action filter implementing ETag and Cache-Control headers.
/// </summary>
public class InventoryCacheFilter : IAsyncActionFilter
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<InventoryCacheFilter> _logger;
    private readonly int _maxAgeSeconds;

    public InventoryCacheFilter(IMemoryCache cache, ILogger<InventoryCacheFilter> logger, int maxAgeSeconds)
    {
        _cache = cache;
        _logger = logger;
        _maxAgeSeconds = maxAgeSeconds;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var request = context.HttpContext.Request;

        // Only cache GET requests
        if (!HttpMethods.IsGet(request.Method))
        {
            // For PUT/DELETE: validate If-Match header
            if (HttpMethods.IsPut(request.Method) || HttpMethods.IsDelete(request.Method))
            {
                var ifMatch = request.Headers.IfMatch.ToString();
                if (!string.IsNullOrEmpty(ifMatch))
                {
                    var cacheKey = BuildCacheKey(request);
                    var storedETag = _cache.Get<string>(cacheKey);

                    if (storedETag != null && ifMatch != storedETag && ifMatch != "*")
                    {
                        context.Result = new StatusCodeResult(StatusCodes.Status412PreconditionFailed);
                        return;
                    }
                }
            }

            var mutationResult = await next();

            // Invalidate cache on successful mutations
            if (mutationResult.Exception == null)
            {
                InvalidateRelatedCaches(request);
            }
            return;
        }

        // GET request: check If-None-Match
        var ifNoneMatch = request.Headers.IfNoneMatch.ToString();
        var responseCacheKey = BuildCacheKey(request);

        // Execute the action
        var executedContext = await next();

        if (executedContext.Exception != null) return;

        // Generate ETag from response
        if (executedContext.Result is ObjectResult objectResult && objectResult.Value != null)
        {
            var etag = GenerateETag(objectResult.Value);

            // Store ETag in cache
            _cache.Set(responseCacheKey, etag, TimeSpan.FromSeconds(_maxAgeSeconds * 2));

            // Check if client has current version
            if (!string.IsNullOrEmpty(ifNoneMatch) && ifNoneMatch == etag)
            {
                context.Result = new StatusCodeResult(StatusCodes.Status304NotModified);
                context.HttpContext.Response.Headers.ETag = etag;
                context.HttpContext.Response.Headers.CacheControl = $"private, max-age={_maxAgeSeconds}";
                return;
            }

            // Add cache headers to response
            context.HttpContext.Response.Headers.ETag = etag;
            context.HttpContext.Response.Headers.CacheControl = $"private, max-age={_maxAgeSeconds}";
            context.HttpContext.Response.Headers["X-Cache-Status"] = "MISS";
        }
    }

    private static string BuildCacheKey(HttpRequest request)
    {
        return $"inv_etag:{request.Path}{request.QueryString}";
    }

    private static string GenerateETag(object value)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(value);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(json));
        return $"\"{Convert.ToBase64String(hash[..16])}\"";
    }

    private void InvalidateRelatedCaches(HttpRequest request)
    {
        // For mutations, we invalidate the specific resource cache
        // The cache key pattern means the next GET will generate a fresh ETag
        var path = request.Path.ToString();
        var basePath = path.Contains('/') ? path[..path.LastIndexOf('/')] : path;
        var cacheKey = $"inv_etag:{basePath}";

        // Remove parent list cache
        _cache.Remove(cacheKey);
        _logger.LogDebug("Cache invalidated for path: {Path}", basePath);
    }
}

/// <summary>
/// Tenant-aware response cache that isolates cached data per tenant.
/// </summary>
public class TenantResponseCache
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<TenantResponseCache> _logger;

    public TenantResponseCache(IMemoryCache cache, ILogger<TenantResponseCache> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Get cached response for a tenant-specific key.
    /// </summary>
    public T? Get<T>(string tenantId, string cacheKey) where T : class
    {
        var fullKey = $"inv_resp:{tenantId}:{cacheKey}";
        return _cache.Get<T>(fullKey);
    }

    /// <summary>
    /// Set cached response with expiration.
    /// </summary>
    public void Set<T>(string tenantId, string cacheKey, T value, TimeSpan? expiration = null) where T : class
    {
        var fullKey = $"inv_resp:{tenantId}:{cacheKey}";
        _cache.Set(fullKey, value, expiration ?? TimeSpan.FromMinutes(5));
    }

    /// <summary>
    /// Invalidate all cache entries for a specific tenant and resource pattern.
    /// </summary>
    public void Invalidate(string tenantId, string pattern)
    {
        var key = $"inv_resp:{tenantId}:{pattern}";
        _cache.Remove(key);
        _logger.LogDebug("Tenant cache invalidated: {Key}", key);
    }
}
