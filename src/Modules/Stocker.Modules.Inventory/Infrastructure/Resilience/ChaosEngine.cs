using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Configuration for chaos engineering fault injection.
/// Only active when explicitly enabled (disabled by default in production).
/// </summary>
public class ChaosConfiguration
{
    /// <summary>
    /// Master switch for chaos engineering. Must be explicitly enabled.
    /// </summary>
    public bool Enabled { get; set; } = false;

    /// <summary>
    /// Probability of injecting a fault (0.0 to 1.0).
    /// </summary>
    public double FaultProbability { get; set; } = 0.1;

    /// <summary>
    /// Maximum latency to inject in milliseconds.
    /// </summary>
    public int MaxLatencyMs { get; set; } = 5000;

    /// <summary>
    /// Minimum latency to inject in milliseconds.
    /// </summary>
    public int MinLatencyMs { get; set; } = 100;

    /// <summary>
    /// Probability of injecting an exception (subset of FaultProbability).
    /// </summary>
    public double ExceptionProbability { get; set; } = 0.3;

    /// <summary>
    /// Fault types to inject.
    /// </summary>
    public HashSet<ChaosScenario> ActiveScenarios { get; set; } = new();
}

/// <summary>
/// Types of chaos scenarios that can be injected.
/// </summary>
public enum ChaosScenario
{
    Latency,
    Exception,
    Timeout,
    ResourceExhaustion,
    PartialFailure,
    DataCorruption
}

/// <summary>
/// Chaos engineering engine for fault injection testing.
/// Allows controlled injection of failures to test system resilience.
/// IMPORTANT: Only enable in non-production environments or during scheduled chaos tests.
/// </summary>
public class ChaosEngine
{
    private readonly ChaosConfiguration _config;
    private readonly ILogger<ChaosEngine> _logger;
    private readonly Random _random = new();
    private readonly List<ChaosEvent> _events = new();
    private readonly object _eventsLock = new();

    public ChaosEngine(ChaosConfiguration config, ILogger<ChaosEngine> logger)
    {
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Check if chaos is currently enabled.
    /// </summary>
    public bool IsEnabled => _config.Enabled;

    /// <summary>
    /// Get recent chaos events for monitoring.
    /// </summary>
    public IReadOnlyList<ChaosEvent> GetRecentEvents()
    {
        lock (_eventsLock)
        {
            return _events.TakeLast(100).ToList();
        }
    }

    /// <summary>
    /// Maybe inject a fault based on configuration probability.
    /// No-op when chaos is disabled.
    /// </summary>
    public async Task MaybeInjectFaultAsync(string operationName, CancellationToken cancellationToken = default)
    {
        if (!_config.Enabled) return;

        if (_random.NextDouble() > _config.FaultProbability) return;

        var scenarios = _config.ActiveScenarios.Count > 0
            ? _config.ActiveScenarios.ToList()
            : new List<ChaosScenario> { ChaosScenario.Latency, ChaosScenario.Exception };

        var scenario = scenarios[_random.Next(scenarios.Count)];

        switch (scenario)
        {
            case ChaosScenario.Latency:
                await InjectLatencyAsync(operationName, cancellationToken);
                break;
            case ChaosScenario.Exception:
                InjectException(operationName);
                break;
            case ChaosScenario.Timeout:
                await InjectTimeoutAsync(operationName, cancellationToken);
                break;
            case ChaosScenario.ResourceExhaustion:
                InjectResourceExhaustion(operationName);
                break;
            case ChaosScenario.PartialFailure:
                if (_random.NextDouble() < _config.ExceptionProbability)
                    InjectException(operationName);
                break;
            default:
                break;
        }
    }

    /// <summary>
    /// Inject a specific fault type for targeted testing.
    /// </summary>
    public async Task InjectSpecificFaultAsync(ChaosScenario scenario, string operationName, CancellationToken cancellationToken = default)
    {
        if (!_config.Enabled) return;

        switch (scenario)
        {
            case ChaosScenario.Latency:
                await InjectLatencyAsync(operationName, cancellationToken);
                break;
            case ChaosScenario.Exception:
                InjectException(operationName);
                break;
            case ChaosScenario.Timeout:
                await InjectTimeoutAsync(operationName, cancellationToken);
                break;
            case ChaosScenario.ResourceExhaustion:
                InjectResourceExhaustion(operationName);
                break;
        }
    }

    private async Task InjectLatencyAsync(string operationName, CancellationToken cancellationToken)
    {
        var delay = _random.Next(_config.MinLatencyMs, _config.MaxLatencyMs);
        RecordEvent(operationName, ChaosScenario.Latency, $"Injecting {delay}ms latency");

        _logger.LogWarning("[CHAOS] Injecting {Delay}ms latency into {Operation}", delay, operationName);
        await Task.Delay(delay, cancellationToken);
    }

    private void InjectException(string operationName)
    {
        RecordEvent(operationName, ChaosScenario.Exception, "Injecting exception");

        _logger.LogWarning("[CHAOS] Injecting exception into {Operation}", operationName);
        throw new ChaosInjectedException(operationName, ChaosScenario.Exception);
    }

    private async Task InjectTimeoutAsync(string operationName, CancellationToken cancellationToken)
    {
        RecordEvent(operationName, ChaosScenario.Timeout, "Injecting timeout");

        _logger.LogWarning("[CHAOS] Injecting timeout into {Operation}", operationName);
        // Simulate a very long operation that will likely be cancelled
        await Task.Delay(TimeSpan.FromMinutes(5), cancellationToken);
    }

    private void InjectResourceExhaustion(string operationName)
    {
        RecordEvent(operationName, ChaosScenario.ResourceExhaustion, "Injecting resource exhaustion");

        _logger.LogWarning("[CHAOS] Injecting resource exhaustion into {Operation}", operationName);
        throw new ChaosInjectedException(operationName, ChaosScenario.ResourceExhaustion,
            new OutOfMemoryException("Chaos: Simulated resource exhaustion"));
    }

    private void RecordEvent(string operationName, ChaosScenario scenario, string description)
    {
        lock (_eventsLock)
        {
            _events.Add(new ChaosEvent
            {
                Timestamp = DateTime.UtcNow,
                OperationName = operationName,
                Scenario = scenario,
                Description = description
            });

            // Keep only last 1000 events
            if (_events.Count > 1000)
            {
                _events.RemoveRange(0, _events.Count - 1000);
            }
        }
    }

    /// <summary>
    /// Enable chaos with the specified configuration.
    /// </summary>
    public void Enable(double? faultProbability = null, IEnumerable<ChaosScenario>? scenarios = null)
    {
        _config.Enabled = true;
        if (faultProbability.HasValue) _config.FaultProbability = faultProbability.Value;
        if (scenarios != null) _config.ActiveScenarios = new HashSet<ChaosScenario>(scenarios);

        _logger.LogWarning("[CHAOS] Chaos engineering ENABLED. Probability={Probability}, Scenarios={Scenarios}",
            _config.FaultProbability, string.Join(", ", _config.ActiveScenarios));
    }

    /// <summary>
    /// Disable all chaos injection.
    /// </summary>
    public void Disable()
    {
        _config.Enabled = false;
        _logger.LogInformation("[CHAOS] Chaos engineering DISABLED");
    }
}

/// <summary>
/// Record of an injected chaos event.
/// </summary>
public class ChaosEvent
{
    public DateTime Timestamp { get; init; }
    public string OperationName { get; init; } = string.Empty;
    public ChaosScenario Scenario { get; init; }
    public string Description { get; init; } = string.Empty;
}

/// <summary>
/// Exception thrown when chaos engine injects a fault.
/// </summary>
public class ChaosInjectedException : Exception
{
    public string OperationName { get; }
    public ChaosScenario Scenario { get; }

    public ChaosInjectedException(string operationName, ChaosScenario scenario, Exception? inner = null)
        : base($"[CHAOS] Injected {scenario} fault in operation '{operationName}'", inner)
    {
        OperationName = operationName;
        Scenario = scenario;
    }
}
