using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.RateLimiting;

/// <summary>
/// Inventory-specific rate limiting policies.
/// Provides per-tenant, per-endpoint rate limiting for critical inventory operations.
/// </summary>
public static class InventoryRateLimitPolicies
{
    public const int StockMovementLimit = 30;
    public const int AdjustmentLimit = 20;
    public const int TransferLimit = 15;
    public const int BulkOperationLimit = 5;
    public const int ReadOperationLimit = 200;
    public const int AnalyticsLimit = 10;
}

/// <summary>
/// Inventory rate limit attribute that acts as both attribute and filter.
/// Uses TypeFilterAttribute to enable DI-based filter activation.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class InventoryRateLimitAttribute : TypeFilterAttribute
{
    public InventoryRateLimitAttribute(int maxRequests, int windowSeconds = 60, string policyName = "default")
        : base(typeof(InventoryRateLimitFilter))
    {
        Arguments = new object[] { maxRequests, windowSeconds, policyName };
    }
}

/// <summary>
/// Action filter that enforces per-tenant inventory rate limiting.
/// </summary>
public class InventoryRateLimitFilter : IAsyncActionFilter
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<InventoryRateLimitFilter> _logger;
    private readonly int _maxRequests;
    private readonly int _windowSeconds;
    private readonly string _policyName;

    public InventoryRateLimitFilter(
        IMemoryCache cache,
        ILogger<InventoryRateLimitFilter> logger,
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
        var key = $"inv_rl_{tenantId}_{_policyName}_{actionName}";
        var windowTimeSpan = TimeSpan.FromSeconds(_windowSeconds);

        var currentCount = _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = windowTimeSpan;
            return 0;
        });

        if (currentCount >= _maxRequests)
        {
            _logger.LogWarning(
                "Inventory rate limit exceeded: Tenant={TenantId}, Policy={Policy}, Endpoint={Endpoint}, Limit={Limit}",
                tenantId, _policyName, actionName, _maxRequests);

            context.HttpContext.Response.Headers["X-RateLimit-Limit"] = _maxRequests.ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = "0";
            context.HttpContext.Response.Headers["X-RateLimit-Reset"] =
                DateTimeOffset.UtcNow.Add(windowTimeSpan).ToUnixTimeSeconds().ToString();
            context.HttpContext.Response.Headers["X-RateLimit-Policy"] = _policyName;

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
