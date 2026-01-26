using Microsoft.Extensions.Logging;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Polly.Timeout;
using Stocker.Shared.Contracts.Inventory;

namespace Stocker.Modules.Sales.Infrastructure.Services;

/// <summary>
/// Resilient wrapper around IInventoryService that adds retry, circuit breaker, and timeout policies.
/// This protects Sales module from cascading failures when Inventory module is unavailable.
/// </summary>
public class ResilientInventoryService : IInventoryService
{
    private readonly IInventoryService _innerService;
    private readonly ILogger<ResilientInventoryService> _logger;
    private readonly ResiliencePipeline _resiliencePipeline;

    // Circuit breaker state tracking for monitoring
    private static int _consecutiveFailures;
    private static DateTime? _circuitOpenedAt;

    public ResilientInventoryService(
        IInventoryService innerService,
        ILogger<ResilientInventoryService> logger)
    {
        _innerService = innerService;
        _logger = logger;
        _resiliencePipeline = BuildResiliencePipeline();
    }

    private ResiliencePipeline BuildResiliencePipeline()
    {
        return new ResiliencePipelineBuilder()
            // Timeout: 10 seconds per operation
            .AddTimeout(new TimeoutStrategyOptions
            {
                Timeout = TimeSpan.FromSeconds(10),
                OnTimeout = args =>
                {
                    _logger.LogWarning(
                        "Inventory service call timed out after {Timeout}s",
                        args.Timeout.TotalSeconds);
                    return default;
                }
            })
            // Retry: 3 attempts with exponential backoff
            .AddRetry(new RetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromMilliseconds(200),
                BackoffType = DelayBackoffType.Exponential,
                UseJitter = true,
                ShouldHandle = new PredicateBuilder()
                    .Handle<TimeoutException>()
                    .Handle<TimeoutRejectedException>()
                    .Handle<InvalidOperationException>()
                    .Handle<Exception>(ex => IsTransientException(ex)),
                OnRetry = args =>
                {
                    _logger.LogWarning(
                        "Inventory service call failed (attempt {Attempt}), retrying in {Delay}ms. Error: {Error}",
                        args.AttemptNumber,
                        args.RetryDelay.TotalMilliseconds,
                        args.Outcome.Exception?.Message);
                    return default;
                }
            })
            // Circuit Breaker: Open after 5 failures in 30 seconds
            .AddCircuitBreaker(new CircuitBreakerStrategyOptions
            {
                FailureRatio = 0.5,
                SamplingDuration = TimeSpan.FromSeconds(30),
                MinimumThroughput = 5,
                BreakDuration = TimeSpan.FromSeconds(30),
                ShouldHandle = new PredicateBuilder()
                    .Handle<TimeoutException>()
                    .Handle<TimeoutRejectedException>()
                    .Handle<Exception>(ex => IsTransientException(ex)),
                OnOpened = args =>
                {
                    _circuitOpenedAt = DateTime.UtcNow;
                    _logger.LogError(
                        "Circuit breaker OPENED for Inventory service. Break duration: {Duration}s. Reason: {Reason}",
                        args.BreakDuration.TotalSeconds,
                        args.Outcome.Exception?.Message);
                    return default;
                },
                OnClosed = args =>
                {
                    var openDuration = _circuitOpenedAt.HasValue
                        ? (DateTime.UtcNow - _circuitOpenedAt.Value).TotalSeconds
                        : 0;
                    _circuitOpenedAt = null;
                    _consecutiveFailures = 0;
                    _logger.LogInformation(
                        "Circuit breaker CLOSED for Inventory service. Circuit was open for {Duration}s",
                        openDuration);
                    return default;
                },
                OnHalfOpened = args =>
                {
                    _logger.LogInformation("Circuit breaker HALF-OPEN for Inventory service. Testing connectivity...");
                    return default;
                }
            })
            .Build();
    }

    private static bool IsTransientException(Exception ex)
    {
        // Consider these as transient errors that might succeed on retry
        return ex is TaskCanceledException
            || ex is OperationCanceledException
            || (ex.Message?.Contains("temporarily unavailable", StringComparison.OrdinalIgnoreCase) ?? false)
            || (ex.Message?.Contains("connection", StringComparison.OrdinalIgnoreCase) ?? false)
            || (ex.Message?.Contains("network", StringComparison.OrdinalIgnoreCase) ?? false);
    }

    public async Task<bool> HasSufficientStockAsync(
        Guid productId,
        Guid tenantId,
        decimal quantity,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _resiliencePipeline.ExecuteAsync(
                async ct => await _innerService.HasSufficientStockAsync(productId, tenantId, quantity, ct),
                cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogWarning(ex,
                "Circuit breaker is open - returning false for HasSufficientStockAsync (fail-safe)");
            // Fail-safe: assume no stock when circuit is open
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Inventory service call failed for HasSufficientStockAsync. ProductId={ProductId}",
                productId);
            throw;
        }
    }

    public async Task<decimal> GetAvailableStockAsync(
        Guid productId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _resiliencePipeline.ExecuteAsync(
                async ct => await _innerService.GetAvailableStockAsync(productId, tenantId, ct),
                cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogWarning(ex,
                "Circuit breaker is open - returning 0 for GetAvailableStockAsync (fail-safe)");
            // Fail-safe: return 0 stock when circuit is open
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Inventory service call failed for GetAvailableStockAsync. ProductId={ProductId}",
                productId);
            throw;
        }
    }

    public async Task<bool> ReserveStockAsync(
        Guid orderId,
        Guid tenantId,
        IEnumerable<StockReservationDto> reservations,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _resiliencePipeline.ExecuteAsync(
                async ct => await _innerService.ReserveStockAsync(orderId, tenantId, reservations, ct),
                cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogWarning(ex,
                "Circuit breaker is open - returning false for ReserveStockAsync. Order will proceed without reservation.");
            // Fail-safe: return false (reservation failed) - order can still proceed without reservation
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Inventory service call failed for ReserveStockAsync. OrderId={OrderId}",
                orderId);
            throw;
        }
    }

    public async Task<bool> ReleaseReservedStockAsync(
        Guid orderId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _resiliencePipeline.ExecuteAsync(
                async ct => await _innerService.ReleaseReservedStockAsync(orderId, tenantId, ct),
                cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogWarning(ex,
                "Circuit breaker is open - ReleaseReservedStockAsync failed. Manual stock release may be required for OrderId={OrderId}",
                orderId);
            // Can't fail-safe here - need to log for manual intervention
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Inventory service call failed for ReleaseReservedStockAsync. OrderId={OrderId}",
                orderId);
            throw;
        }
    }

    public async Task<ProductDto?> GetProductByIdAsync(
        Guid productId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _resiliencePipeline.ExecuteAsync(
                async ct => await _innerService.GetProductByIdAsync(productId, tenantId, ct),
                cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogWarning(ex,
                "Circuit breaker is open - returning null for GetProductByIdAsync");
            // Fail-safe: return null when circuit is open
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Inventory service call failed for GetProductByIdAsync. ProductId={ProductId}",
                productId);
            throw;
        }
    }

    public async Task<IEnumerable<ProductDto>> GetActiveProductsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _resiliencePipeline.ExecuteAsync(
                async ct => await _innerService.GetActiveProductsAsync(tenantId, ct),
                cancellationToken);
        }
        catch (BrokenCircuitException ex)
        {
            _logger.LogWarning(ex,
                "Circuit breaker is open - returning empty list for GetActiveProductsAsync");
            // Fail-safe: return empty list when circuit is open
            return Enumerable.Empty<ProductDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Inventory service call failed for GetActiveProductsAsync. TenantId={TenantId}",
                tenantId);
            throw;
        }
    }
}
