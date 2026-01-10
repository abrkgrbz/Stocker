using Prometheus;

namespace Stocker.Infrastructure.Metrics;

/// <summary>
/// Prometheus metrics for domain events monitoring
/// </summary>
public static class DomainEventMetrics
{
    private static readonly Counter DomainEventsTotal = Prometheus.Metrics.CreateCounter(
        "stocker_domain_events_total",
        "Total number of domain events raised",
        new CounterConfiguration
        {
            LabelNames = new[] { "module", "event_type", "entity_type", "tenant_id" }
        });

    private static readonly Counter DomainEventsHandledTotal = Prometheus.Metrics.CreateCounter(
        "stocker_domain_events_handled_total",
        "Total number of domain events successfully handled",
        new CounterConfiguration
        {
            LabelNames = new[] { "module", "event_type", "handler" }
        });

    private static readonly Counter DomainEventsFailedTotal = Prometheus.Metrics.CreateCounter(
        "stocker_domain_events_failed_total",
        "Total number of domain events that failed to be handled",
        new CounterConfiguration
        {
            LabelNames = new[] { "module", "event_type", "handler", "error_type" }
        });

    private static readonly Histogram DomainEventHandlingDuration = Prometheus.Metrics.CreateHistogram(
        "stocker_domain_event_handling_duration_seconds",
        "Duration of domain event handling in seconds",
        new HistogramConfiguration
        {
            LabelNames = new[] { "module", "event_type", "handler" },
            Buckets = new[] { .001, .005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10 }
        });

    private static readonly Gauge DomainEventsInProgress = Prometheus.Metrics.CreateGauge(
        "stocker_domain_events_in_progress",
        "Number of domain events currently being processed",
        new GaugeConfiguration
        {
            LabelNames = new[] { "module" }
        });

    /// <summary>
    /// Records a domain event being raised
    /// </summary>
    public static void RecordEventRaised(string module, string eventType, string entityType, string tenantId)
    {
        DomainEventsTotal.WithLabels(module, eventType, entityType, tenantId).Inc();
    }

    /// <summary>
    /// Records a domain event being successfully handled
    /// </summary>
    public static void RecordEventHandled(string module, string eventType, string handler)
    {
        DomainEventsHandledTotal.WithLabels(module, eventType, handler).Inc();
    }

    /// <summary>
    /// Records a domain event handling failure
    /// </summary>
    public static void RecordEventFailed(string module, string eventType, string handler, string errorType)
    {
        DomainEventsFailedTotal.WithLabels(module, eventType, handler, errorType).Inc();
    }

    /// <summary>
    /// Creates a timer for measuring event handling duration
    /// </summary>
    public static Prometheus.ITimer StartHandlingTimer(string module, string eventType, string handler)
    {
        return DomainEventHandlingDuration.WithLabels(module, eventType, handler).NewTimer();
    }

    /// <summary>
    /// Increments the in-progress counter for a module
    /// </summary>
    public static void IncrementInProgress(string module)
    {
        DomainEventsInProgress.WithLabels(module).Inc();
    }

    /// <summary>
    /// Decrements the in-progress counter for a module
    /// </summary>
    public static void DecrementInProgress(string module)
    {
        DomainEventsInProgress.WithLabels(module).Dec();
    }
}

/// <summary>
/// Extension interface for metric tracking in handlers
/// </summary>
public interface IDomainEventMetricsTracker
{
    void TrackEventRaised(string module, string eventType, string entityType, Guid tenantId);
    void TrackEventHandled(string module, string eventType, string handler, TimeSpan duration);
    void TrackEventFailed(string module, string eventType, string handler, Exception exception);
}

/// <summary>
/// Default implementation of domain event metrics tracker
/// </summary>
public class DomainEventMetricsTracker : IDomainEventMetricsTracker
{
    public void TrackEventRaised(string module, string eventType, string entityType, Guid tenantId)
    {
        DomainEventMetrics.RecordEventRaised(module, eventType, entityType, tenantId.ToString());
    }

    public void TrackEventHandled(string module, string eventType, string handler, TimeSpan duration)
    {
        DomainEventMetrics.RecordEventHandled(module, eventType, handler);
    }

    public void TrackEventFailed(string module, string eventType, string handler, Exception exception)
    {
        DomainEventMetrics.RecordEventFailed(module, eventType, handler, exception.GetType().Name);
    }
}
