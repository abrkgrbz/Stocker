using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Stocker.Application.Common.Attributes;

/// <summary>
/// Attribute for output caching of action results
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class OutputCacheAttribute : ActionFilterAttribute, IAsyncActionFilter
{
    private readonly int _durationInSeconds;
    private readonly bool _varyByUser;
    private readonly string[] _varyByParams;
    private readonly string[] _varyByHeaders;
    private readonly string _cacheProfile;

    /// <summary>
    /// Initialize output cache with duration
    /// </summary>
    /// <param name="durationInSeconds">Cache duration in seconds</param>
    public OutputCacheAttribute(int durationInSeconds = 60)
    {
        _durationInSeconds = durationInSeconds;
        _varyByUser = false;
        _varyByParams = Array.Empty<string>();
        _varyByHeaders = Array.Empty<string>();
        _cacheProfile = string.Empty;
    }

    /// <summary>
    /// Duration in seconds for caching
    /// </summary>
    public int Duration
    {
        get => _durationInSeconds;
        init => _durationInSeconds = value;
    }

    /// <summary>
    /// Vary cache by authenticated user
    /// </summary>
    public bool VaryByUser
    {
        get => _varyByUser;
        init => _varyByUser = value;
    }

    /// <summary>
    /// Query parameters to vary cache by
    /// </summary>
    public string[] VaryByQueryParams
    {
        get => _varyByParams;
        init => _varyByParams = value ?? Array.Empty<string>();
    }

    /// <summary>
    /// Headers to vary cache by
    /// </summary>
    public string[] VaryByHeaders
    {
        get => _varyByHeaders;
        init => _varyByHeaders = value ?? Array.Empty<string>();
    }

    /// <summary>
    /// Cache profile name for configuration
    /// </summary>
    public string CacheProfile
    {
        get => _cacheProfile;
        init => _cacheProfile = value ?? string.Empty;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Skip caching for non-GET requests
        if (context.HttpContext.Request.Method != "GET")
        {
            await next();
            return;
        }

        var cache = context.HttpContext.RequestServices.GetService<IDistributedCache>();
        if (cache == null)
        {
            await next();
            return;
        }

        var cacheKey = GenerateCacheKey(context);

        // Try to get from cache
        var cachedResult = await cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedResult))
        {
            var result = JsonSerializer.Deserialize<CachedActionResult>(cachedResult);
            if (result != null && result.ExpiresAt > DateTimeOffset.UtcNow)
            {
                // Serve from cache
                context.Result = new ContentResult
                {
                    Content = result.Content,
                    ContentType = result.ContentType,
                    StatusCode = result.StatusCode
                };

                // Add cache headers
                context.HttpContext.Response.Headers["X-Cache"] = "HIT";
                context.HttpContext.Response.Headers["X-Cache-Expires"] = result.ExpiresAt.ToString("O");

                return;
            }
        }

        // Execute action
        var executedContext = await next();

        // Cache successful results
        if (executedContext.Result is ObjectResult objectResult &&
            objectResult.StatusCode is null or >= 200 and < 300)
        {
            var resultToCache = new CachedActionResult
            {
                Content = JsonSerializer.Serialize(objectResult.Value),
                ContentType = "application/json",
                StatusCode = objectResult.StatusCode ?? 200,
                ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(_durationInSeconds)
            };

            var cacheEntryOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_durationInSeconds)
            };

            await cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(resultToCache),
                cacheEntryOptions);

            // Add cache headers
            context.HttpContext.Response.Headers["X-Cache"] = "MISS";
            context.HttpContext.Response.Headers["X-Cache-Duration"] = _durationInSeconds.ToString();
        }
    }

    private string GenerateCacheKey(ActionExecutingContext context)
    {
        var keyBuilder = new StringBuilder();
        keyBuilder.Append("output_cache:");
        keyBuilder.Append(context.Controller.GetType().Name);
        keyBuilder.Append(":");
        keyBuilder.Append(context.ActionDescriptor.DisplayName);

        // Add query parameters
        if (_varyByParams.Length > 0)
        {
            foreach (var param in _varyByParams)
            {
                if (context.HttpContext.Request.Query.TryGetValue(param, out var value))
                {
                    keyBuilder.Append($":{param}={value}");
                }
            }
        }
        else if (context.HttpContext.Request.QueryString.HasValue)
        {
            keyBuilder.Append(context.HttpContext.Request.QueryString);
        }

        // Add headers
        foreach (var header in _varyByHeaders)
        {
            if (context.HttpContext.Request.Headers.TryGetValue(header, out var value))
            {
                keyBuilder.Append($":{header}={value}");
            }
        }

        // Add user identity
        if (_varyByUser && context.HttpContext.User?.Identity?.IsAuthenticated == true)
        {
            keyBuilder.Append($":user={context.HttpContext.User.Identity.Name}");
        }

        // Hash for consistent length
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(keyBuilder.ToString()));
        return Convert.ToBase64String(hashBytes);
    }

    private class CachedActionResult
    {
        public string Content { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
    }
}

/// <summary>
/// Cache profile for output caching
/// </summary>
public class CacheProfile
{
    public int Duration { get; set; }
    public bool VaryByUser { get; set; }
    public string[] VaryByQueryParams { get; set; } = Array.Empty<string>();
    public string[] VaryByHeaders { get; set; } = Array.Empty<string>();
    public bool NoStore { get; set; }
    public string? Location { get; set; }
}

/// <summary>
/// Common cache profiles
/// </summary>
public static class CacheProfiles
{
    public const string Default = "Default";
    public const string NoCache = "NoCache";
    public const string Short = "Short";
    public const string Medium = "Medium";
    public const string Long = "Long";
    public const string UserSpecific = "UserSpecific";

    public static Dictionary<string, CacheProfile> Profiles => new()
    {
        [NoCache] = new CacheProfile { Duration = 0, NoStore = true },
        [Short] = new CacheProfile { Duration = 60 }, // 1 minute
        [Medium] = new CacheProfile { Duration = 300 }, // 5 minutes
        [Long] = new CacheProfile { Duration = 3600 }, // 1 hour
        [UserSpecific] = new CacheProfile { Duration = 300, VaryByUser = true }
    };
}