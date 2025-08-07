using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;

namespace Stocker.API.Filters;

/// <summary>
/// Rate limiting filter for API endpoints
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RateLimitFilterAttribute : ActionFilterAttribute
{
    private readonly int _maxRequests;
    private readonly TimeSpan _timeWindow;
    
    /// <summary>
    /// Rate limit configuration name (loaded from settings)
    /// </summary>
    public string? Name { get; set; }
    
    /// <summary>
    /// Maximum requests per time window
    /// </summary>
    public int MaxRequests { get; set; } = 100;
    
    /// <summary>
    /// Time window in seconds
    /// </summary>
    public int TimeWindowSeconds { get; set; } = 60;
    
    public RateLimitFilterAttribute()
    {
        _maxRequests = MaxRequests;
        _timeWindow = TimeSpan.FromSeconds(TimeWindowSeconds);
    }
    
    public RateLimitFilterAttribute(int maxRequests, int timeWindowSeconds)
    {
        _maxRequests = maxRequests;
        _timeWindow = TimeSpan.FromSeconds(timeWindowSeconds);
        MaxRequests = maxRequests;
        TimeWindowSeconds = timeWindowSeconds;
    }
    
    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var cache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
        var configuration = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        
        // Load configuration if Name is specified
        var maxRequests = _maxRequests;
        var timeWindow = _timeWindow;
        
        if (!string.IsNullOrEmpty(Name))
        {
            var configSection = configuration.GetSection($"RateLimiting:{Name}");
            if (configSection.Exists())
            {
                maxRequests = configSection.GetValue<int>("MaxRequests", _maxRequests);
                var windowSeconds = configSection.GetValue<int>("TimeWindowSeconds", TimeWindowSeconds);
                timeWindow = TimeSpan.FromSeconds(windowSeconds);
            }
        }
        
        // Generate key based on user/IP
        var key = GenerateClientKey(context);
        var cacheKey = $"rate_limit_{key}_{context.ActionDescriptor.DisplayName}";
        
        // Get current request count
        var requestCount = await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = timeWindow;
            return 0;
        });
        
        if (requestCount >= maxRequests)
        {
            // Add rate limit headers
            context.HttpContext.Response.Headers["X-RateLimit-Limit"] = maxRequests.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = "0";
            context.HttpContext.Response.Headers["X-RateLimit-Reset"] = DateTimeOffset.UtcNow.Add(timeWindow).ToUnixTimeSeconds().ToString();
            
            context.Result = new ObjectResult(new
            {
                error = "Rate limit exceeded",
                message = $"Maximum {maxRequests} requests per {timeWindow.TotalSeconds} seconds exceeded"
            })
            {
                StatusCode = 429 // Too Many Requests
            };
            
            return;
        }
        
        // Increment counter
        cache.Set(cacheKey, requestCount + 1, timeWindow);
        
        // Add rate limit headers
        context.HttpContext.Response.Headers["X-RateLimit-Limit"] = maxRequests.ToString();
        context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = (maxRequests - requestCount - 1).ToString();
        context.HttpContext.Response.Headers["X-RateLimit-Reset"] = DateTimeOffset.UtcNow.Add(timeWindow).ToUnixTimeSeconds().ToString();
        
        await next();
    }
    
    private string GenerateClientKey(ActionExecutingContext context)
    {
        var httpContext = context.HttpContext;
        
        // Prefer authenticated user ID
        var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            return $"user_{userId}";
        }
        
        // Fallback to IP address
        var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
        return $"ip_{ipAddress ?? "unknown"}";
    }
}