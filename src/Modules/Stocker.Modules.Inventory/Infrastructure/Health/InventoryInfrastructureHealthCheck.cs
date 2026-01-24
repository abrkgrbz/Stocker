using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Infrastructure.Integration;
using Stocker.Modules.Inventory.Infrastructure.Resilience;

namespace Stocker.Modules.Inventory.Infrastructure.Health;

/// <summary>
/// Comprehensive health check for Inventory infrastructure components.
/// Monitors circuit breakers, retry queues, outbox, and integration services.
/// </summary>
public class InventoryInfrastructureHealthCheck : IHealthCheck
{
    private readonly CircuitBreakerRegistry _circuitBreakerRegistry;
    private readonly RetryQueue _retryQueue;
    private readonly OutboxProcessor _outboxProcessor;
    private readonly ILogger<InventoryInfrastructureHealthCheck> _logger;

    // Thresholds
    private const int RetryQueueCriticalThreshold = 200;
    private const int RetryQueueWarningThreshold = 50;
    private const int OutboxPendingCriticalThreshold = 500;
    private const int OutboxPendingWarningThreshold = 100;
    private const int OutboxFailedWarningThreshold = 10;
    private const int DeadLetterWarningThreshold = 20;

    public InventoryInfrastructureHealthCheck(
        CircuitBreakerRegistry circuitBreakerRegistry,
        RetryQueue retryQueue,
        OutboxProcessor outboxProcessor,
        ILogger<InventoryInfrastructureHealthCheck> logger)
    {
        _circuitBreakerRegistry = circuitBreakerRegistry;
        _retryQueue = retryQueue;
        _outboxProcessor = outboxProcessor;
        _logger = logger;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var data = new Dictionary<string, object>();
        var issues = new List<string>();
        var degradedReasons = new List<string>();

        // 1. Check Circuit Breakers
        CheckCircuitBreakers(data, issues, degradedReasons);

        // 2. Check Retry Queue
        CheckRetryQueue(data, issues, degradedReasons);

        // 3. Check Outbox
        CheckOutbox(data, issues, degradedReasons);

        // Determine overall status
        if (issues.Count > 0)
        {
            var message = $"Infrastructure unhealthy: {string.Join("; ", issues)}";
            _logger.LogWarning("Health check UNHEALTHY: {Message}", message);
            return Task.FromResult(HealthCheckResult.Unhealthy(message, data: data));
        }

        if (degradedReasons.Count > 0)
        {
            var message = $"Infrastructure degraded: {string.Join("; ", degradedReasons)}";
            _logger.LogInformation("Health check DEGRADED: {Message}", message);
            return Task.FromResult(HealthCheckResult.Degraded(message, data: data));
        }

        data["status_summary"] = "All infrastructure components operating normally";
        return Task.FromResult(HealthCheckResult.Healthy(
            "Inventory infrastructure healthy.", data: data));
    }

    private void CheckCircuitBreakers(
        Dictionary<string, object> data,
        List<string> issues,
        List<string> degradedReasons)
    {
        var circuitBreakers = _circuitBreakerRegistry.GetAll();
        var openCircuits = new List<string>();
        var halfOpenCircuits = new List<string>();

        foreach (var (name, breaker) in circuitBreakers)
        {
            var state = breaker.State.ToString();
            data[$"circuit_breaker_{name}"] = state;

            if (breaker.State == CircuitState.Open)
                openCircuits.Add(name);
            else if (breaker.State == CircuitState.HalfOpen)
                halfOpenCircuits.Add(name);
        }

        if (openCircuits.Count > 0)
        {
            issues.Add($"Circuit breakers OPEN: {string.Join(", ", openCircuits)}");
        }

        if (halfOpenCircuits.Count > 0)
        {
            degradedReasons.Add($"Circuit breakers recovering: {string.Join(", ", halfOpenCircuits)}");
        }

        data["circuit_breakers_total"] = circuitBreakers.Count;
        data["circuit_breakers_open"] = openCircuits.Count;
        data["circuit_breakers_half_open"] = halfOpenCircuits.Count;
    }

    private void CheckRetryQueue(
        Dictionary<string, object> data,
        List<string> issues,
        List<string> degradedReasons)
    {
        var stats = _retryQueue.GetStats();
        data["retry_queue_pending"] = stats.PendingCount;
        data["retry_queue_processing"] = stats.ProcessingCount;
        data["retry_queue_dead_lettered"] = stats.DeadLetteredCount;
        data["retry_queue_total"] = stats.TotalEnqueued;

        if (stats.PendingCount >= RetryQueueCriticalThreshold)
        {
            issues.Add($"Retry queue critically high: {stats.PendingCount} pending");
        }
        else if (stats.PendingCount >= RetryQueueWarningThreshold)
        {
            degradedReasons.Add($"Retry queue elevated: {stats.PendingCount} pending");
        }

        if (stats.DeadLetteredCount >= DeadLetterWarningThreshold)
        {
            degradedReasons.Add($"Dead letter queue has {stats.DeadLetteredCount} entries");
        }
    }

    private void CheckOutbox(
        Dictionary<string, object> data,
        List<string> issues,
        List<string> degradedReasons)
    {
        var stats = _outboxProcessor.GetStats();
        data["outbox_pending"] = stats.PendingCount;
        data["outbox_processing"] = stats.ProcessingCount;
        data["outbox_processed"] = stats.ProcessedCount;
        data["outbox_failed"] = stats.FailedCount;
        data["outbox_total"] = stats.TotalMessages;

        if (stats.PendingCount >= OutboxPendingCriticalThreshold)
        {
            issues.Add($"Outbox critically backed up: {stats.PendingCount} pending");
        }
        else if (stats.PendingCount >= OutboxPendingWarningThreshold)
        {
            degradedReasons.Add($"Outbox elevated: {stats.PendingCount} pending");
        }

        if (stats.FailedCount >= OutboxFailedWarningThreshold)
        {
            degradedReasons.Add($"Outbox has {stats.FailedCount} permanently failed messages");
        }
    }
}
