using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Net;
using System.Security.Claims;
using System.Text.Json;

namespace Stocker.Infrastructure.Middleware.RateLimiting;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IDistributedCache _cache;
    private readonly RateLimitingOptions _options;

    public RateLimitingMiddleware(
        RequestDelegate next,
        IDistributedCache cache,
        IOptions<RateLimitingOptions> options)
    {
        _next = next;
        _cache = cache;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.GetEndpoint();
        var rateLimitAttribute = endpoint?.Metadata.GetMetadata<RateLimitAttribute>();
        
        if (rateLimitAttribute == null && !_options.EnableGlobalRateLimit)
        {
            await _next(context);
            return;
        }

        var key = GenerateClientKey(context);
        var rateLimitCounter = await GetRateLimitCounter(key);
        
        var limit = rateLimitAttribute?.Limit ?? _options.GlobalLimit;
        var period = rateLimitAttribute?.PeriodInSeconds ?? _options.GlobalPeriodInSeconds;

        if (rateLimitCounter != null && rateLimitCounter.Count >= limit)
        {
            await HandleRateLimitExceeded(context, rateLimitCounter, limit, period);
            return;
        }

        await UpdateCounter(key, period);
        
        // Add rate limit headers to response
        context.Response.OnStarting(() =>
        {
            context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = Math.Max(0, limit - (rateLimitCounter?.Count ?? 0) - 1).ToString();
            context.Response.Headers["X-RateLimit-Reset"] = DateTimeOffset.UtcNow.AddSeconds(period).ToUnixTimeSeconds().ToString();
            
            return Task.CompletedTask;
        });

        await _next(context);
    }

    private string GenerateClientKey(HttpContext context)
    {
        var path = context.Request.Path.ToString().ToLowerInvariant();
        
        // Try to use authenticated user ID first
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            return $"rate_limit:{userId}:{path}";
        }

        // Use tenant ID if available
        var tenantId = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
        if (!string.IsNullOrEmpty(tenantId))
        {
            return $"rate_limit:tenant:{tenantId}:{path}";
        }

        // Fall back to IP address
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"rate_limit:ip:{ipAddress}:{path}";
    }

    private async Task<RateLimitCounter?> GetRateLimitCounter(string key)
    {
        var cacheValue = await _cache.GetStringAsync(key);
        
        if (string.IsNullOrEmpty(cacheValue))
            return null;

        return JsonSerializer.Deserialize<RateLimitCounter>(cacheValue);
    }

    private async Task UpdateCounter(string key, int periodInSeconds)
    {
        var counter = await GetRateLimitCounter(key) ?? new RateLimitCounter
        {
            StartTime = DateTime.UtcNow,
            Count = 0
        };

        counter.Count++;

        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(periodInSeconds)
        };

        await _cache.SetStringAsync(key, JsonSerializer.Serialize(counter), options);
    }

    private async Task HandleRateLimitExceeded(HttpContext context, RateLimitCounter counter, int limit, int period)
    {
        context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
        context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = "0";
        context.Response.Headers["X-RateLimit-Reset"] = DateTimeOffset.UtcNow.AddSeconds(period).ToUnixTimeSeconds().ToString();
        context.Response.Headers["Retry-After"] = period.ToString();

        var response = new
        {
            error = new
            {
                code = "RATE_LIMIT_EXCEEDED",
                message = $"Rate limit exceeded. Maximum {limit} requests per {period} seconds allowed.",
                retryAfter = period,
                resetTime = DateTimeOffset.UtcNow.AddSeconds(period).ToUnixTimeSeconds()
            }
        };

        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}

public class RateLimitingOptions
{
    public bool EnableGlobalRateLimit { get; set; } = true;
    public int GlobalLimit { get; set; } = 100;
    public int GlobalPeriodInSeconds { get; set; } = 60;
    
    // Different limits for different client types
    public Dictionary<string, RateLimitRule> Rules { get; set; } = new();
}

public class RateLimitRule
{
    public int Limit { get; set; }
    public int PeriodInSeconds { get; set; }
    public string[]? WhitelistedIps { get; set; }
    public string[]? WhitelistedClients { get; set; }
}

public class RateLimitCounter
{
    public DateTime StartTime { get; set; }
    public int Count { get; set; }
}

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class RateLimitAttribute : Attribute
{
    public int Limit { get; set; }
    public int PeriodInSeconds { get; set; }

    public RateLimitAttribute(int limit = 100, int periodInSeconds = 60)
    {
        Limit = limit;
        PeriodInSeconds = periodInSeconds;
    }
}

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class NoRateLimitAttribute : Attribute
{
    // Marker attribute to exclude endpoints from rate limiting
}

public static class RateLimitingExtensions
{
    public static IServiceCollection AddRateLimiting(this IServiceCollection services, Action<RateLimitingOptions>? configureOptions = null)
    {
        var options = new RateLimitingOptions();
        configureOptions?.Invoke(options);
        
        services.Configure<RateLimitingOptions>(opt =>
        {
            opt.EnableGlobalRateLimit = options.EnableGlobalRateLimit;
            opt.GlobalLimit = options.GlobalLimit;
            opt.GlobalPeriodInSeconds = options.GlobalPeriodInSeconds;
            opt.Rules = options.Rules;
        });

        return services;
    }

    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder app)
    {
        return app.UseMiddleware<RateLimitingMiddleware>();
    }
}