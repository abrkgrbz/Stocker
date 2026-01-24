using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.RateLimiting;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.RateLimiting;

/// <summary>
/// Middleware for implementing per-tenant rate limiting
/// </summary>
public class TenantRateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantRateLimitingMiddleware> _logger;
    private readonly IMemoryCache _cache;
    private readonly TenantRateLimitingOptions _options;

    public TenantRateLimitingMiddleware(
        RequestDelegate next,
        ILogger<TenantRateLimitingMiddleware> logger,
        IMemoryCache cache,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _cache = cache;

        // Use Bind() to properly read from both appsettings.json and environment variables
        _options = new TenantRateLimitingOptions();
        configuration.GetSection("TenantRateLimiting").Bind(_options);

        _logger.LogInformation(
            "TenantRateLimiting initialized: Enabled={Enabled}, PermitLimit={PermitLimit}, Algorithm={Algorithm}",
            _options.Enabled, _options.PermitLimit, _options.Algorithm);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip rate limiting if disabled via config
        if (!_options.Enabled)
        {
            await _next(context);
            return;
        }

        // Skip rate limiting in Testing environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Testing")
        {
            await _next(context);
            return;
        }
        
        // Skip rate limiting for certain paths
        if (ShouldSkipRateLimiting(context))
        {
            await _next(context);
            return;
        }

        // Get tenant identifier
        var tenantId = GetTenantIdentifier(context);
        if (string.IsNullOrEmpty(tenantId))
        {
            // Skip rate limiting for anonymous/IP-based requests
            // Only rate limit authenticated tenant requests
            await _next(context);
            return;
        }

        // Get or create rate limiter for this tenant
        var rateLimiter = GetOrCreateRateLimiter(tenantId, context);

        // Check rate limit
        using var lease = await rateLimiter.AcquireAsync();
        
        if (lease.IsAcquired)
        {
            // Add rate limit headers to response
            AddRateLimitHeaders(context, lease);
            
            // Continue processing
            await _next(context);
        }
        else
        {
            // Rate limit exceeded
            await HandleRateLimitExceeded(context, lease);
        }
    }

    private bool ShouldSkipRateLimiting(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";

        // Skip rate limiting for health checks, static files, auth, etc.
        var skipPaths = new[]
        {
            "/health",
            "/swagger",
            "/hangfire",
            "/.well-known",
            "/favicon.ico",
            "/api/tenant/securitysettings", // Settings page needs frequent access
            "/hubs/", // SignalR hubs have their own rate limiting (SignalRRateLimiter)
            "/api/auth", // Auth endpoints handle their own security (lockout, etc.)
            "/api/crm", // CRM endpoints for stress testing
            "/api/inventory", // Inventory endpoints have module-specific rate limiting
            "/api/sales" // Sales endpoints have module-specific rate limiting (SalesRateLimitAttribute)
        };

        foreach (var skipPath in skipPaths)
        {
            if (path.Contains(skipPath))
                return true;
        }

        return false;
    }

    private string GetTenantIdentifier(HttpContext context)
    {
        // Try to get tenant ID from various sources
        
        // 1. From authenticated user claims
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("TenantId") 
                           ?? context.User.FindFirst("tenant_id");
            if (tenantClaim != null)
                return $"tenant_{tenantClaim.Value}";
        }

        // 2. From request header
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader))
        {
            return $"tenant_{tenantHeader}";
        }

        // 3. From subdomain
        var host = context.Request.Host.Host;
        if (!string.IsNullOrEmpty(host) && !host.StartsWith("localhost"))
        {
            var subdomain = host.Split('.')[0];
            if (!string.IsNullOrEmpty(subdomain) && subdomain != "www" && subdomain != "api")
            {
                return $"tenant_{subdomain}";
            }
        }

        return string.Empty;
    }

    private string GetClientIpAddress(HttpContext context)
    {
        // Check for proxy headers first
        if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
            var ips = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries);
            if (ips.Length > 0)
            {
                return $"ip_{ips[0].Trim()}";
            }
        }

        if (context.Request.Headers.ContainsKey("X-Real-IP"))
        {
            return $"ip_{context.Request.Headers["X-Real-IP"]}";
        }

        // Fall back to remote IP
        return $"ip_{context.Connection.RemoteIpAddress}";
    }

    private RateLimiter GetOrCreateRateLimiter(string tenantId, HttpContext context)
    {
        var cacheKey = $"rate_limiter_{tenantId}";
        
        return _cache.GetOrCreate<RateLimiter>(cacheKey, entry =>
        {
            entry.SlidingExpiration = TimeSpan.FromMinutes(5);
            
            var options = GetRateLimitOptions(tenantId, context);
            
            // Create appropriate rate limiter based on configuration
            return options.Algorithm switch
            {
                RateLimitAlgorithm.FixedWindow => new FixedWindowRateLimiter(new FixedWindowRateLimiterOptions
                {
                    PermitLimit = options.PermitLimit,
                    Window = TimeSpan.FromSeconds(options.WindowSeconds),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = options.QueueLimit,
                    AutoReplenishment = true
                }),
                
                RateLimitAlgorithm.SlidingWindow => new SlidingWindowRateLimiter(new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = options.PermitLimit,
                    Window = TimeSpan.FromSeconds(options.WindowSeconds),
                    SegmentsPerWindow = options.SegmentsPerWindow,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = options.QueueLimit,
                    AutoReplenishment = true
                }),
                
                RateLimitAlgorithm.TokenBucket => new TokenBucketRateLimiter(new TokenBucketRateLimiterOptions
                {
                    TokenLimit = options.PermitLimit,
                    TokensPerPeriod = options.TokensPerPeriod,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(options.ReplenishmentPeriodSeconds),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = options.QueueLimit,
                    AutoReplenishment = true
                }),
                
                _ => new ConcurrencyLimiter(new ConcurrencyLimiterOptions
                {
                    PermitLimit = options.PermitLimit,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = options.QueueLimit
                })
            };
        });
    }

    private TenantRateLimitingOptions GetRateLimitOptions(string tenantId, HttpContext context)
    {
        // Customize rate limits based on tenant, endpoint, or subscription level
        var endpoint = context.Request.Path.Value?.ToLower() ?? "";
        
        // Special limits for auth endpoints
        // Increased to 30 to support 2FA flow (login + check lockout + verify 2FA + retries)
        if (endpoint.Contains("/auth") || endpoint.Contains("/login"))
        {
            return new TenantRateLimitingOptions
            {
                Algorithm = RateLimitAlgorithm.FixedWindow,
                PermitLimit = 30,
                WindowSeconds = 60,
                QueueLimit = 0
            };
        }
        
        // Special limits for API endpoints
        if (endpoint.StartsWith("/api/"))
        {
            // Check if this is a premium tenant (you would implement this check)
            var isPremiumTenant = CheckIfPremiumTenant(tenantId);
            
            if (isPremiumTenant)
            {
                return new TenantRateLimitingOptions
                {
                    Algorithm = RateLimitAlgorithm.TokenBucket,
                    PermitLimit = 1000,
                    TokensPerPeriod = 100,
                    ReplenishmentPeriodSeconds = 1,
                    QueueLimit = 10
                };
            }
        }
        
        // Default options
        return _options;
    }

    private bool CheckIfPremiumTenant(string tenantId)
    {
        // Extract the actual tenant ID from the key format (e.g., "tenant_123" -> "123")
        var actualTenantId = tenantId.StartsWith("tenant_") 
            ? tenantId.Substring(7) 
            : tenantId;

        if (string.IsNullOrEmpty(actualTenantId) || actualTenantId.StartsWith("ip_"))
        {
            // Not a tenant-based request (IP-based), not premium
            return false;
        }

        // Check in cache first
        var cacheKey = $"tenant_premium_{actualTenantId}";
        if (_cache.TryGetValue<bool>(cacheKey, out var isPremium))
        {
            return isPremium;
        }

        // If not in cache, default to standard limits
        // In a real implementation, you would check the database here
        // For now, we'll cache the result for 5 minutes
        _cache.Set(cacheKey, false, TimeSpan.FromMinutes(5));
        
        return false;
    }

    private void AddRateLimitHeaders(HttpContext context, RateLimitLease lease)
    {
        var headers = context.Response.Headers;
        
        // Add standard rate limit headers
        headers["X-RateLimit-Limit"] = _options.PermitLimit.ToString();
        
        // In .NET 9, RateLimitLease doesn't have Metadata property
        // We'll use a simplified approach
        if (!lease.IsAcquired)
        {
            headers["X-RateLimit-Remaining"] = "0";
            headers["Retry-After"] = _options.WindowSeconds.ToString();
        }
        else
        {
            // Calculate remaining from lease if available
            headers["X-RateLimit-Remaining"] = "1"; // Simplified
        }
        
        // Add reset time
        var resetTime = DateTimeOffset.UtcNow.AddSeconds(_options.WindowSeconds).ToUnixTimeSeconds();
        headers["X-RateLimit-Reset"] = resetTime.ToString();
    }

    private async Task HandleRateLimitExceeded(HttpContext context, RateLimitLease lease)
    {
        _logger.LogWarning(
            "Rate limit exceeded for {TenantId} on {Path}", 
            GetTenantIdentifier(context), 
            context.Request.Path);
        
        context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        
        // Add rate limit headers
        AddRateLimitHeaders(context, lease);
        
        // Write error response
        var response = new
        {
            error = "Rate limit exceeded",
            message = "Too many requests. Please retry after some time.",
            retryAfter = _options.WindowSeconds
        };
        
        await context.Response.WriteAsJsonAsync(response);
    }
}

/// <summary>
/// Configuration options for tenant rate limiting
/// </summary>
public class TenantRateLimitingOptions
{
    public bool Enabled { get; set; } = true;
    public RateLimitAlgorithm Algorithm { get; set; } = RateLimitAlgorithm.SlidingWindow;
    public int PermitLimit { get; set; } = 500;
    public int WindowSeconds { get; set; } = 60;
    public int QueueLimit { get; set; } = 5;
    
    // For sliding window
    public int SegmentsPerWindow { get; set; } = 4;
    
    // For token bucket
    public int TokensPerPeriod { get; set; } = 10;
    public int ReplenishmentPeriodSeconds { get; set; } = 1;
}

/// <summary>
/// Rate limiting algorithm types
/// </summary>
public enum RateLimitAlgorithm
{
    FixedWindow,
    SlidingWindow,
    TokenBucket,
    Concurrency
}

/// <summary>
/// Rate limit options for a specific tenant
/// </summary>
public class TenantRateLimitOptions
{
    public RateLimitAlgorithm Algorithm { get; set; }
    public int PermitLimit { get; set; }
    public int WindowSeconds { get; set; }
    public int QueueLimit { get; set; }
    public int SegmentsPerWindow { get; set; }
    public int TokensPerPeriod { get; set; }
    public int ReplenishmentPeriodSeconds { get; set; }
}