using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior for invalidating cache after commands
/// </summary>
public class CacheInvalidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CacheInvalidationBehavior<TRequest, TResponse>> _logger;

    public CacheInvalidationBehavior(
        ICacheService cacheService,
        ILogger<CacheInvalidationBehavior<TRequest, TResponse>> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Execute the handler first
        var response = await next();

        // Only invalidate cache for commands that implement ICacheInvalidatingCommand
        if (request is ICacheInvalidatingCommand invalidatingCommand)
        {
            var requestName = typeof(TRequest).Name;
            var keysToInvalidate = invalidatingCommand.CacheKeysToInvalidate;

            if (keysToInvalidate?.Length > 0)
            {
                foreach (var key in keysToInvalidate)
                {
                    // Check if it's a pattern (contains *)
                    if (key.Contains('*'))
                    {
                        await _cacheService.RemoveByPatternAsync(key, cancellationToken);
                        _logger.LogDebug("Invalidated cache pattern {CachePattern} after {RequestName}",
                            key, requestName);
                    }
                    else
                    {
                        await _cacheService.RemoveAsync(key, cancellationToken);
                        _logger.LogDebug("Invalidated cache key {CacheKey} after {RequestName}",
                            key, requestName);
                    }
                }

                _logger.LogInformation("Invalidated {Count} cache entries after {RequestName}",
                    keysToInvalidate.Length, requestName);
            }
        }

        return response;
    }
}
