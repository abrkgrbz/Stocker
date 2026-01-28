namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Marker interface for queries that can be cached
/// </summary>
public interface ICacheableQuery
{
    /// <summary>
    /// Cache key for this query
    /// </summary>
    string CacheKey { get; }

    /// <summary>
    /// Cache duration in minutes (default: 5)
    /// </summary>
    int CacheDurationMinutes => 5;

    /// <summary>
    /// Whether to bypass cache and force refresh
    /// </summary>
    bool BypassCache => false;
}

/// <summary>
/// Marker interface for commands that invalidate cache
/// </summary>
public interface ICacheInvalidatingCommand
{
    /// <summary>
    /// Cache keys or patterns to invalidate
    /// </summary>
    string[] CacheKeysToInvalidate { get; }
}
