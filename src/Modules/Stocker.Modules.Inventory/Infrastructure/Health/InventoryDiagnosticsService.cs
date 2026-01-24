using Stocker.Modules.Inventory.Infrastructure.Integration;
using Stocker.Modules.Inventory.Infrastructure.Resilience;

namespace Stocker.Modules.Inventory.Infrastructure.Health;

/// <summary>
/// Comprehensive diagnostics snapshot for the inventory module.
/// </summary>
public class InventoryDiagnosticsSnapshot
{
    public DateTime GeneratedAt { get; init; } = DateTime.UtcNow;
    public CircuitBreakerDiagnostics CircuitBreakers { get; init; } = new();
    public RetryQueueDiagnostics RetryQueue { get; init; } = new();
    public OutboxDiagnostics Outbox { get; init; } = new();
    public WebhookDiagnostics Webhooks { get; init; } = new();
    public ChaosEngineDiagnostics ChaosEngine { get; init; } = new();
    public BackgroundServiceDiagnostics BackgroundServices { get; init; } = new();
}

public class CircuitBreakerDiagnostics
{
    public int TotalCount { get; init; }
    public int ClosedCount { get; init; }
    public int OpenCount { get; init; }
    public int HalfOpenCount { get; init; }
    public List<CircuitBreakerDetail> Details { get; init; } = new();
}

public class CircuitBreakerDetail
{
    public string Name { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public int FailureCount { get; init; }
    public int SuccessCount { get; init; }
}

public class RetryQueueDiagnostics
{
    public int PendingCount { get; init; }
    public int ProcessingCount { get; init; }
    public int CompletedCount { get; init; }
    public int DeadLetteredCount { get; init; }
    public int TotalEnqueued { get; init; }
}

public class OutboxDiagnostics
{
    public int PendingCount { get; init; }
    public int ProcessingCount { get; init; }
    public int ProcessedCount { get; init; }
    public int FailedCount { get; init; }
    public int TotalMessages { get; init; }
}

public class WebhookDiagnostics
{
    public int TotalSubscriptions { get; init; }
    public int ActiveSubscriptions { get; init; }
    public int RecentDeliveries { get; init; }
    public int RecentSuccessful { get; init; }
    public int RecentFailed { get; init; }
}

public class ChaosEngineDiagnostics
{
    public bool Enabled { get; init; }
    public int RecentEventsCount { get; init; }
}

public class BackgroundServiceDiagnostics
{
    public int RegisteredCount { get; init; }
    public List<BackgroundServiceStatus> Services { get; init; } = new();
}

public class BackgroundServiceStatus
{
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = "Unknown";
    public DateTime? LastExecutionTime { get; init; }
}

/// <summary>
/// Service that aggregates diagnostics from all inventory infrastructure components.
/// </summary>
public class InventoryDiagnosticsService
{
    private readonly CircuitBreakerRegistry _circuitBreakerRegistry;
    private readonly RetryQueue _retryQueue;
    private readonly OutboxProcessor _outboxProcessor;
    private readonly WebhookService _webhookService;
    private readonly ChaosConfiguration _chaosConfiguration;

    public InventoryDiagnosticsService(
        CircuitBreakerRegistry circuitBreakerRegistry,
        RetryQueue retryQueue,
        OutboxProcessor outboxProcessor,
        WebhookService webhookService,
        ChaosConfiguration chaosConfiguration)
    {
        _circuitBreakerRegistry = circuitBreakerRegistry;
        _retryQueue = retryQueue;
        _outboxProcessor = outboxProcessor;
        _webhookService = webhookService;
        _chaosConfiguration = chaosConfiguration;
    }

    /// <summary>
    /// Generate a comprehensive diagnostics snapshot.
    /// </summary>
    public InventoryDiagnosticsSnapshot GetSnapshot()
    {
        return new InventoryDiagnosticsSnapshot
        {
            CircuitBreakers = GetCircuitBreakerDiagnostics(),
            RetryQueue = GetRetryQueueDiagnostics(),
            Outbox = GetOutboxDiagnostics(),
            Webhooks = GetWebhookDiagnostics(),
            ChaosEngine = GetChaosEngineDiagnostics(),
            BackgroundServices = GetBackgroundServiceDiagnostics()
        };
    }

    private CircuitBreakerDiagnostics GetCircuitBreakerDiagnostics()
    {
        var all = _circuitBreakerRegistry.GetAll();
        var details = new List<CircuitBreakerDetail>();

        foreach (var (name, breaker) in all)
        {
            details.Add(new CircuitBreakerDetail
            {
                Name = name,
                State = breaker.State.ToString()
            });
        }

        return new CircuitBreakerDiagnostics
        {
            TotalCount = all.Count,
            ClosedCount = details.Count(d => d.State == "Closed"),
            OpenCount = details.Count(d => d.State == "Open"),
            HalfOpenCount = details.Count(d => d.State == "HalfOpen"),
            Details = details
        };
    }

    private RetryQueueDiagnostics GetRetryQueueDiagnostics()
    {
        var stats = _retryQueue.GetStats();
        return new RetryQueueDiagnostics
        {
            PendingCount = stats.PendingCount,
            ProcessingCount = stats.ProcessingCount,
            CompletedCount = stats.CompletedCount,
            DeadLetteredCount = stats.DeadLetteredCount,
            TotalEnqueued = stats.TotalEnqueued
        };
    }

    private OutboxDiagnostics GetOutboxDiagnostics()
    {
        var stats = _outboxProcessor.GetStats();
        return new OutboxDiagnostics
        {
            PendingCount = stats.PendingCount,
            ProcessingCount = stats.ProcessingCount,
            ProcessedCount = stats.ProcessedCount,
            FailedCount = stats.FailedCount,
            TotalMessages = stats.TotalMessages
        };
    }

    private WebhookDiagnostics GetWebhookDiagnostics()
    {
        var recentDeliveries = _webhookService.GetRecentDeliveries(100);
        return new WebhookDiagnostics
        {
            RecentDeliveries = recentDeliveries.Count,
            RecentSuccessful = recentDeliveries.Count(d => d.Success),
            RecentFailed = recentDeliveries.Count(d => !d.Success)
        };
    }

    private ChaosEngineDiagnostics GetChaosEngineDiagnostics()
    {
        return new ChaosEngineDiagnostics
        {
            Enabled = _chaosConfiguration.Enabled
        };
    }

    private BackgroundServiceDiagnostics GetBackgroundServiceDiagnostics()
    {
        // Background services are hosted services - we track their names
        var services = new List<BackgroundServiceStatus>
        {
            new() { Name = "ReservationCleanupService", Status = "Registered" },
            new() { Name = "TransferTimeoutMonitorService", Status = "Registered" },
            new() { Name = "AuditFallbackProcessorService", Status = "Registered" }
        };

        return new BackgroundServiceDiagnostics
        {
            RegisteredCount = services.Count,
            Services = services
        };
    }
}
