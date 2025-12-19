using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Stocker.SignalR.Services;

/// <summary>
/// Rate limiting options for SignalR hubs
/// </summary>
public class SignalRRateLimitOptions
{
    public const string SectionName = "SignalR:RateLimiting";

    /// <summary>
    /// Maximum number of requests allowed per window
    /// </summary>
    public int MaxRequestsPerWindow { get; set; } = 100;

    /// <summary>
    /// Time window in seconds
    /// </summary>
    public int WindowSizeSeconds { get; set; } = 60;

    /// <summary>
    /// Cleanup interval in minutes for expired entries
    /// </summary>
    public int CleanupIntervalMinutes { get; set; } = 5;

    /// <summary>
    /// Whether rate limiting is enabled
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Per-operation rate limits (operation name -> max requests per window)
    /// </summary>
    public Dictionary<string, int> OperationLimits { get; set; } = new();
}

/// <summary>
/// Interface for SignalR rate limiting
/// </summary>
public interface ISignalRRateLimiter
{
    /// <summary>
    /// Checks if the request is allowed based on rate limiting rules
    /// </summary>
    /// <param name="connectionId">The connection ID making the request</param>
    /// <param name="operationName">Optional operation name for operation-specific limits</param>
    /// <returns>True if allowed, false if rate limited</returns>
    bool IsAllowed(string connectionId, string? operationName = null);

    /// <summary>
    /// Gets the remaining requests for a connection
    /// </summary>
    /// <param name="connectionId">The connection ID</param>
    /// <param name="operationName">Optional operation name</param>
    /// <returns>Number of remaining requests in the current window</returns>
    int GetRemainingRequests(string connectionId, string? operationName = null);

    /// <summary>
    /// Resets the rate limit for a connection
    /// </summary>
    /// <param name="connectionId">The connection ID to reset</param>
    void Reset(string connectionId);

    /// <summary>
    /// Gets rate limit statistics
    /// </summary>
    RateLimitStatistics GetStatistics();
}

/// <summary>
/// Rate limit statistics
/// </summary>
public class RateLimitStatistics
{
    public int TotalConnections { get; set; }
    public int TotalRequestsTracked { get; set; }
    public int RateLimitedRequests { get; set; }
    public DateTime LastCleanup { get; set; }
}

/// <summary>
/// In-memory implementation of SignalR rate limiting using sliding window algorithm
/// </summary>
public class SignalRRateLimiter : ISignalRRateLimiter, IDisposable
{
    private readonly ConcurrentDictionary<string, RateLimitEntry> _entries = new();
    private readonly SignalRRateLimitOptions _options;
    private readonly ILogger<SignalRRateLimiter> _logger;
    private readonly Timer _cleanupTimer;
    private int _rateLimitedCount;
    private DateTime _lastCleanup = DateTime.UtcNow;

    private class RateLimitEntry
    {
        public ConcurrentQueue<DateTime> Requests { get; } = new();
        public DateTime LastRequest { get; set; } = DateTime.UtcNow;
    }

    public SignalRRateLimiter(
        IOptions<SignalRRateLimitOptions> options,
        ILogger<SignalRRateLimiter> logger)
    {
        _options = options.Value;
        _logger = logger;

        _cleanupTimer = new Timer(
            CleanupExpiredEntries,
            null,
            TimeSpan.FromMinutes(_options.CleanupIntervalMinutes),
            TimeSpan.FromMinutes(_options.CleanupIntervalMinutes));
    }

    public bool IsAllowed(string connectionId, string? operationName = null)
    {
        if (!_options.Enabled)
        {
            return true;
        }

        var key = GetKey(connectionId, operationName);
        var limit = GetLimit(operationName);
        var windowSize = TimeSpan.FromSeconds(_options.WindowSizeSeconds);
        var now = DateTime.UtcNow;

        var entry = _entries.GetOrAdd(key, _ => new RateLimitEntry());

        // Clean old requests outside the window
        while (entry.Requests.TryPeek(out var oldest) && now - oldest > windowSize)
        {
            entry.Requests.TryDequeue(out _);
        }

        // Check if under limit
        if (entry.Requests.Count >= limit)
        {
            Interlocked.Increment(ref _rateLimitedCount);
            _logger.LogWarning(
                "Rate limit exceeded: ConnectionId={ConnectionId}, Operation={Operation}, RequestCount={Count}, Limit={Limit}",
                connectionId, operationName ?? "global", entry.Requests.Count, limit);
            return false;
        }

        // Record this request
        entry.Requests.Enqueue(now);
        entry.LastRequest = now;

        return true;
    }

    public int GetRemainingRequests(string connectionId, string? operationName = null)
    {
        var key = GetKey(connectionId, operationName);
        var limit = GetLimit(operationName);
        var windowSize = TimeSpan.FromSeconds(_options.WindowSizeSeconds);
        var now = DateTime.UtcNow;

        if (!_entries.TryGetValue(key, out var entry))
        {
            return limit;
        }

        // Count requests in current window
        var requestsInWindow = entry.Requests.Count(r => now - r <= windowSize);
        return Math.Max(0, limit - requestsInWindow);
    }

    public void Reset(string connectionId)
    {
        // Remove all entries for this connection
        var keysToRemove = _entries.Keys
            .Where(k => k.StartsWith($"{connectionId}:") || k == connectionId)
            .ToList();

        foreach (var key in keysToRemove)
        {
            _entries.TryRemove(key, out _);
        }

        _logger.LogDebug("Rate limit reset: ConnectionId={ConnectionId}", connectionId);
    }

    public RateLimitStatistics GetStatistics()
    {
        return new RateLimitStatistics
        {
            TotalConnections = _entries.Count,
            TotalRequestsTracked = _entries.Values.Sum(e => e.Requests.Count),
            RateLimitedRequests = _rateLimitedCount,
            LastCleanup = _lastCleanup
        };
    }

    private string GetKey(string connectionId, string? operationName)
    {
        return string.IsNullOrEmpty(operationName)
            ? connectionId
            : $"{connectionId}:{operationName}";
    }

    private int GetLimit(string? operationName)
    {
        if (!string.IsNullOrEmpty(operationName) &&
            _options.OperationLimits.TryGetValue(operationName, out var operationLimit))
        {
            return operationLimit;
        }

        return _options.MaxRequestsPerWindow;
    }

    private void CleanupExpiredEntries(object? state)
    {
        var windowSize = TimeSpan.FromSeconds(_options.WindowSizeSeconds);
        var now = DateTime.UtcNow;
        var cleanedCount = 0;

        foreach (var kvp in _entries)
        {
            // Remove entries that haven't had requests in 2x the window
            if (now - kvp.Value.LastRequest > windowSize * 2)
            {
                if (_entries.TryRemove(kvp.Key, out _))
                {
                    cleanedCount++;
                }
            }
        }

        _lastCleanup = now;

        if (cleanedCount > 0)
        {
            _logger.LogDebug("Rate limit cleanup: EntriesRemoved={Count}", cleanedCount);
        }
    }

    public void Dispose()
    {
        _cleanupTimer.Dispose();
    }
}
