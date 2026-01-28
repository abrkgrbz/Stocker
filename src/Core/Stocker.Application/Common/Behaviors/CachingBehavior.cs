using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior for caching query results
/// </summary>
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public CachingBehavior(
        ICacheService cacheService,
        ILogger<CachingBehavior<TRequest, TResponse>> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Only apply caching to queries that implement ICacheableQuery
        if (request is not ICacheableQuery cacheableQuery)
        {
            return await next();
        }

        var cacheKey = cacheableQuery.CacheKey;
        var requestName = typeof(TRequest).Name;

        // Check if cache should be bypassed
        if (cacheableQuery.BypassCache)
        {
            _logger.LogDebug("Bypassing cache for {RequestName} with key {CacheKey}",
                requestName, cacheKey);
            return await next();
        }

        // Try to get from cache
        var cachedResponse = await _cacheService.GetAsync<TResponse>(cacheKey, cancellationToken);

        if (cachedResponse is not null)
        {
            _logger.LogDebug("Cache hit for {RequestName} with key {CacheKey}",
                requestName, cacheKey);
            return cachedResponse;
        }

        _logger.LogDebug("Cache miss for {RequestName} with key {CacheKey}",
            requestName, cacheKey);

        // Execute the handler
        var response = await next();

        // Cache the result if not null
        if (response is not null)
        {
            var expiry = TimeSpan.FromMinutes(cacheableQuery.CacheDurationMinutes);
            await _cacheService.SetAsync(cacheKey, response, expiry, cancellationToken);

            _logger.LogDebug("Cached response for {RequestName} with key {CacheKey}, duration {Duration} min",
                requestName, cacheKey, cacheableQuery.CacheDurationMinutes);
        }

        return response;
    }
}
