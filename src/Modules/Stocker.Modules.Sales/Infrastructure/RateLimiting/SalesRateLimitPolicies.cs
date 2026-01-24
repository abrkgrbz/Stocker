using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Sales.Infrastructure.RateLimiting;

/// <summary>
/// Sales-specific rate limiting policies.
/// Provides per-tenant, per-endpoint rate limiting for critical sales operations.
/// </summary>
public static class SalesRateLimitPolicies
{
    /// <summary>Order creation - expensive operation with stock checks</summary>
    public const int OrderCreationLimit = 20;

    /// <summary>Order status transitions (confirm, ship, deliver, complete)</summary>
    public const int StatusTransitionLimit = 30;

    /// <summary>Order updates and item modifications</summary>
    public const int OrderModificationLimit = 40;

    /// <summary>Order approval - requires authorization checks</summary>
    public const int ApprovalLimit = 15;

    /// <summary>Cancellation and deletion - destructive operations</summary>
    public const int CancellationLimit = 10;

    /// <summary>Read operations (list, get by ID, statistics)</summary>
    public const int ReadOperationLimit = 200;

    /// <summary>Bulk operations (future use)</summary>
    public const int BulkOperationLimit = 5;
}

/// <summary>
/// Sales rate limit attribute that acts as both attribute and filter.
/// Uses TypeFilterAttribute to enable DI-based filter activation.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class SalesRateLimitAttribute : TypeFilterAttribute
{
    public SalesRateLimitAttribute(int maxRequests, int windowSeconds = 60, string policyName = "default")
        : base(typeof(SalesRateLimitFilter))
    {
        Arguments = new object[] { maxRequests, windowSeconds, policyName };
    }
}

/// <summary>
/// Action filter that enforces per-tenant sales rate limiting.
/// Tracks request counts in memory cache with sliding expiration.
/// </summary>
public class SalesRateLimitFilter : IAsyncActionFilter
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<SalesRateLimitFilter> _logger;
    private readonly int _maxRequests;
    private readonly int _windowSeconds;
    private readonly string _policyName;

    public SalesRateLimitFilter(
        IMemoryCache cache,
        ILogger<SalesRateLimitFilter> logger,
        int maxRequests,
        int windowSeconds,
        string policyName)
    {
        _cache = cache;
        _logger = logger;
        _maxRequests = maxRequests;
        _windowSeconds = windowSeconds;
        _policyName = policyName;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var tenantId = GetTenantId(context.HttpContext);
        if (string.IsNullOrEmpty(tenantId))
        {
            await next();
            return;
        }

        var actionName = context.ActionDescriptor.DisplayName ?? "unknown";
        var key = $"sales_rl_{tenantId}_{_policyName}_{actionName}";
        var windowTimeSpan = TimeSpan.FromSeconds(_windowSeconds);

        var currentCount = _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = windowTimeSpan;
            return 0;
        });

        if (currentCount >= _maxRequests)
        {
            _logger.LogWarning(
                "Sales rate limit exceeded: Tenant={TenantId}, Policy={Policy}, Endpoint={Endpoint}, Limit={Limit}",
                tenantId, _policyName, actionName, _maxRequests);

            context.HttpContext.Response.Headers["X-RateLimit-Limit"] = _maxRequests.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = "0";
            context.HttpContext.Response.Headers["X-RateLimit-Reset"] =
                DateTimeOffset.UtcNow.Add(windowTimeSpan).ToUnixTimeSeconds().ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Policy"] = _policyName;
            context.HttpContext.Response.Headers["Retry-After"] = _windowSeconds.ToString();

            context.Result = new ObjectResult(new
            {
                error = "Rate limit exceeded",
                message = $"Maximum {_maxRequests} requests per {_windowSeconds} seconds for this operation.",
                policy = _policyName,
                retryAfter = _windowSeconds
            })
            {
                StatusCode = StatusCodes.Status429TooManyRequests
            };
            return;
        }

        _cache.Set(key, currentCount + 1, windowTimeSpan);

        context.HttpContext.Response.Headers["X-RateLimit-Limit"] = _maxRequests.ToString();
        context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = (_maxRequests - currentCount - 1).ToString();
        context.HttpContext.Response.Headers["X-RateLimit-Policy"] = _policyName;

        await next();
    }

    private static string? GetTenantId(HttpContext context)
    {
        var tenantClaim = context.User.FindFirst("TenantId")
                       ?? context.User.FindFirst("tenant_id");
        return tenantClaim?.Value;
    }
}
