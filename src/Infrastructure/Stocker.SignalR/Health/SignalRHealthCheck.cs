using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Stocker.SignalR.Services;

namespace Stocker.SignalR.Health;

/// <summary>
/// Health check for SignalR infrastructure.
/// Monitors connection count, rate limiter status, and overall hub health.
/// </summary>
public class SignalRHealthCheck : IHealthCheck
{
    private readonly IConnectionManager _connectionManager;
    private readonly ISignalRRateLimiter _rateLimiter;
    private readonly ILogger<SignalRHealthCheck> _logger;

    /// <summary>
    /// Maximum number of connections before health degrades
    /// </summary>
    private const int MaxHealthyConnections = 10000;

    /// <summary>
    /// Warning threshold for connection count
    /// </summary>
    private const int WarningConnectionThreshold = 8000;

    /// <summary>
    /// Maximum rate limited requests before health degrades
    /// </summary>
    private const int MaxRateLimitedRequests = 1000;

    public SignalRHealthCheck(
        IConnectionManager connectionManager,
        ISignalRRateLimiter rateLimiter,
        ILogger<SignalRHealthCheck> logger)
    {
        _connectionManager = connectionManager;
        _rateLimiter = rateLimiter;
        _logger = logger;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var connectionCount = _connectionManager.GetOnlineUsersCount();
            var totalConnections = _connectionManager.GetAllActiveConnections().Count();
            var rateLimitStats = _rateLimiter.GetStatistics();

            var data = new Dictionary<string, object>
            {
                ["OnlineUsers"] = connectionCount,
                ["TotalConnections"] = totalConnections,
                ["TrackedRateLimitEntries"] = rateLimitStats.TotalConnections,
                ["TotalRequestsTracked"] = rateLimitStats.TotalRequestsTracked,
                ["RateLimitedRequests"] = rateLimitStats.RateLimitedRequests,
                ["LastRateLimitCleanup"] = rateLimitStats.LastCleanup
            };

            // Check for unhealthy conditions
            if (totalConnections > MaxHealthyConnections)
            {
                _logger.LogWarning(
                    "SignalR health check unhealthy: TotalConnections={Connections} exceeds maximum {Max}",
                    totalConnections, MaxHealthyConnections);

                return Task.FromResult(HealthCheckResult.Unhealthy(
                    $"Too many connections: {totalConnections} (max: {MaxHealthyConnections})",
                    data: data));
            }

            // Check for degraded conditions
            var issues = new List<string>();

            if (totalConnections > WarningConnectionThreshold)
            {
                issues.Add($"High connection count: {totalConnections}");
            }

            if (rateLimitStats.RateLimitedRequests > MaxRateLimitedRequests)
            {
                issues.Add($"High rate-limited requests: {rateLimitStats.RateLimitedRequests}");
            }

            if (issues.Count > 0)
            {
                _logger.LogWarning(
                    "SignalR health check degraded: {Issues}",
                    string.Join(", ", issues));

                return Task.FromResult(HealthCheckResult.Degraded(
                    string.Join("; ", issues),
                    data: data));
            }

            return Task.FromResult(HealthCheckResult.Healthy(
                $"SignalR healthy: {connectionCount} online users, {totalConnections} total connections",
                data));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR health check failed");

            return Task.FromResult(HealthCheckResult.Unhealthy(
                "SignalR health check failed",
                ex));
        }
    }
}

/// <summary>
/// Detailed SignalR health check with hub-specific monitoring
/// </summary>
public class DetailedSignalRHealthCheck : IHealthCheck
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<DetailedSignalRHealthCheck> _logger;

    public DetailedSignalRHealthCheck(
        IConnectionManager connectionManager,
        ILogger<DetailedSignalRHealthCheck> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var allConnections = _connectionManager.GetAllActiveConnections().ToList();
            var onlineUsersCount = _connectionManager.GetOnlineUsersCount();

            var data = new Dictionary<string, object>
            {
                ["TotalConnections"] = allConnections.Count,
                ["OnlineUsers"] = onlineUsersCount,
                ["AverageConnectionsPerUser"] = onlineUsersCount > 0
                    ? (double)allConnections.Count / onlineUsersCount
                    : 0,
                ["Timestamp"] = DateTime.UtcNow
            };

            // Memory usage check (rough estimate)
            var estimatedMemoryMB = (allConnections.Count * 1024) / (1024.0 * 1024.0); // ~1KB per connection estimate
            data["EstimatedMemoryMB"] = Math.Round(estimatedMemoryMB, 2);

            if (allConnections.Count == 0)
            {
                return Task.FromResult(HealthCheckResult.Healthy(
                    "SignalR ready: No active connections",
                    data));
            }

            return Task.FromResult(HealthCheckResult.Healthy(
                $"SignalR healthy: {allConnections.Count} connections, {onlineUsersCount} users",
                data));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Detailed SignalR health check failed");

            return Task.FromResult(HealthCheckResult.Unhealthy(
                "Detailed SignalR health check failed",
                ex));
        }
    }
}
