using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Registry for managing named circuit breakers across the application.
/// Provides singleton circuit breaker instances per service name.
/// </summary>
public class CircuitBreakerRegistry
{
    private readonly ConcurrentDictionary<string, CircuitBreaker> _breakers = new();
    private readonly ILoggerFactory _loggerFactory;

    public CircuitBreakerRegistry(ILoggerFactory loggerFactory)
    {
        _loggerFactory = loggerFactory;
    }

    /// <summary>
    /// Get or create a circuit breaker for the specified service.
    /// </summary>
    public CircuitBreaker GetOrCreate(string name, Action<CircuitBreakerOptions>? configure = null)
    {
        return _breakers.GetOrAdd(name, key =>
        {
            var options = new CircuitBreakerOptions { Name = key };
            configure?.Invoke(options);

            var logger = _loggerFactory.CreateLogger<CircuitBreaker>();
            return new CircuitBreaker(options, logger);
        });
    }

    /// <summary>
    /// Get all circuit breakers as name-instance pairs.
    /// </summary>
    public IReadOnlyList<(string Name, CircuitBreaker Breaker)> GetAll()
    {
        return _breakers.Select(kvp => (kvp.Key, kvp.Value)).ToList().AsReadOnly();
    }

    /// <summary>
    /// Get circuit breaker status for monitoring/health checks.
    /// </summary>
    public IReadOnlyDictionary<string, CircuitBreakerStatus> GetAllStatuses()
    {
        return _breakers.ToDictionary(
            kvp => kvp.Key,
            kvp => new CircuitBreakerStatus
            {
                Name = kvp.Key,
                State = kvp.Value.State,
                FailureCount = kvp.Value.FailureCount
            });
    }

    /// <summary>
    /// Reset a specific circuit breaker.
    /// </summary>
    public void Reset(string name)
    {
        if (_breakers.TryGetValue(name, out var breaker))
        {
            breaker.Reset();
        }
    }

    /// <summary>
    /// Reset all circuit breakers.
    /// </summary>
    public void ResetAll()
    {
        foreach (var breaker in _breakers.Values)
        {
            breaker.Reset();
        }
    }
}

public class CircuitBreakerStatus
{
    public string Name { get; set; } = string.Empty;
    public CircuitState State { get; set; }
    public int FailureCount { get; set; }
}

/// <summary>
/// Well-known circuit breaker names for inventory module external services.
/// </summary>
public static class InventoryCircuitBreakers
{
    public const string MinioStorage = "minio-storage";
    public const string SignalRNotification = "signalr-notification";
    public const string RabbitMqPublisher = "rabbitmq-publisher";
    public const string ExternalApi = "external-api";
}
