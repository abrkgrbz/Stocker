using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Circuit breaker states following the standard pattern.
/// </summary>
public enum CircuitState
{
    Closed,     // Normal operation
    Open,       // Failing, reject requests
    HalfOpen    // Testing if service recovered
}

/// <summary>
/// Configuration for circuit breaker behavior.
/// </summary>
public class CircuitBreakerOptions
{
    /// <summary>
    /// Number of consecutive failures before opening the circuit.
    /// </summary>
    public int FailureThreshold { get; set; } = 5;

    /// <summary>
    /// Duration the circuit stays open before transitioning to half-open.
    /// </summary>
    public TimeSpan OpenDuration { get; set; } = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Number of successful calls in half-open state before closing.
    /// </summary>
    public int SuccessThresholdInHalfOpen { get; set; } = 2;

    /// <summary>
    /// Timeout for individual operations.
    /// </summary>
    public TimeSpan OperationTimeout { get; set; } = TimeSpan.FromSeconds(10);

    /// <summary>
    /// Name for logging and identification.
    /// </summary>
    public string Name { get; set; } = "default";
}

/// <summary>
/// Lightweight circuit breaker implementation for protecting external service calls.
/// Thread-safe using interlocked operations.
/// </summary>
public class CircuitBreaker
{
    private readonly CircuitBreakerOptions _options;
    private readonly ILogger _logger;
    private volatile CircuitState _state = CircuitState.Closed;
    private int _failureCount;
    private int _halfOpenSuccessCount;
    private DateTime _lastFailureTime = DateTime.MinValue;
    private DateTime _openedAt = DateTime.MinValue;
    private readonly object _lock = new();

    public CircuitState State => _state;
    public int FailureCount => _failureCount;

    public CircuitBreaker(CircuitBreakerOptions options, ILogger logger)
    {
        _options = options;
        _logger = logger;
    }

    /// <summary>
    /// Execute an action through the circuit breaker.
    /// </summary>
    public async Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken cancellationToken = default)
    {
        EnsureCircuitAllows();

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(_options.OperationTimeout);

            var result = await action(cts.Token);
            OnSuccess();
            return result;
        }
        catch (Exception ex) when (ex is not CircuitBreakerOpenException)
        {
            OnFailure(ex);
            throw;
        }
    }

    /// <summary>
    /// Execute a void action through the circuit breaker.
    /// </summary>
    public async Task ExecuteAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
    {
        EnsureCircuitAllows();

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(_options.OperationTimeout);

            await action(cts.Token);
            OnSuccess();
        }
        catch (Exception ex) when (ex is not CircuitBreakerOpenException)
        {
            OnFailure(ex);
            throw;
        }
    }

    /// <summary>
    /// Execute with fallback when circuit is open.
    /// </summary>
    public async Task<T> ExecuteWithFallbackAsync<T>(
        Func<CancellationToken, Task<T>> action,
        Func<Task<T>> fallback,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await ExecuteAsync(action, cancellationToken);
        }
        catch (CircuitBreakerOpenException)
        {
            _logger.LogWarning("Circuit breaker '{Name}' is open, using fallback", _options.Name);
            return await fallback();
        }
    }

    private void EnsureCircuitAllows()
    {
        lock (_lock)
        {
            switch (_state)
            {
                case CircuitState.Closed:
                    return;

                case CircuitState.Open:
                    if (DateTime.UtcNow - _openedAt >= _options.OpenDuration)
                    {
                        _state = CircuitState.HalfOpen;
                        _halfOpenSuccessCount = 0;
                        _logger.LogInformation("Circuit breaker '{Name}' transitioning to HalfOpen", _options.Name);
                        return;
                    }
                    throw new CircuitBreakerOpenException(_options.Name, _options.OpenDuration - (DateTime.UtcNow - _openedAt));

                case CircuitState.HalfOpen:
                    return;
            }
        }
    }

    private void OnSuccess()
    {
        lock (_lock)
        {
            switch (_state)
            {
                case CircuitState.HalfOpen:
                    _halfOpenSuccessCount++;
                    if (_halfOpenSuccessCount >= _options.SuccessThresholdInHalfOpen)
                    {
                        _state = CircuitState.Closed;
                        _failureCount = 0;
                        _logger.LogInformation("Circuit breaker '{Name}' closed after recovery", _options.Name);
                    }
                    break;

                case CircuitState.Closed:
                    _failureCount = 0;
                    break;
            }
        }
    }

    private void OnFailure(Exception ex)
    {
        lock (_lock)
        {
            _lastFailureTime = DateTime.UtcNow;
            _failureCount++;

            switch (_state)
            {
                case CircuitState.Closed:
                    if (_failureCount >= _options.FailureThreshold)
                    {
                        _state = CircuitState.Open;
                        _openedAt = DateTime.UtcNow;
                        _logger.LogWarning(
                            "Circuit breaker '{Name}' opened after {Count} failures. Last error: {Error}",
                            _options.Name, _failureCount, ex.Message);
                    }
                    break;

                case CircuitState.HalfOpen:
                    _state = CircuitState.Open;
                    _openedAt = DateTime.UtcNow;
                    _logger.LogWarning(
                        "Circuit breaker '{Name}' re-opened from HalfOpen. Error: {Error}",
                        _options.Name, ex.Message);
                    break;
            }
        }
    }

    /// <summary>
    /// Manually reset the circuit breaker to closed state.
    /// </summary>
    public void Reset()
    {
        lock (_lock)
        {
            _state = CircuitState.Closed;
            _failureCount = 0;
            _halfOpenSuccessCount = 0;
            _logger.LogInformation("Circuit breaker '{Name}' manually reset", _options.Name);
        }
    }
}

/// <summary>
/// Exception thrown when circuit breaker is open.
/// </summary>
public class CircuitBreakerOpenException : Exception
{
    public string CircuitName { get; }
    public TimeSpan RemainingOpenTime { get; }

    public CircuitBreakerOpenException(string circuitName, TimeSpan remainingOpenTime)
        : base($"Circuit breaker '{circuitName}' is open. Retry after {remainingOpenTime.TotalSeconds:F0}s.")
    {
        CircuitName = circuitName;
        RemainingOpenTime = remainingOpenTime;
    }
}
