using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace Stocker.Modules.Inventory.Infrastructure.Observability;

/// <summary>
/// Centralized inventory module metrics using System.Diagnostics.Metrics.
/// Compatible with OpenTelemetry, Prometheus, and other metric collectors.
/// </summary>
public class InventoryMetrics
{
    public static readonly string MeterName = "Stocker.Inventory";
    public static readonly string ActivitySourceName = "Stocker.Inventory";

    private readonly Meter _meter;
    private readonly ActivitySource _activitySource;

    // Counters
    private readonly Counter<long> _stockMovementsCreated;
    private readonly Counter<long> _stockTransfersCreated;
    private readonly Counter<long> _adjustmentsCreated;
    private readonly Counter<long> _reservationsCreated;
    private readonly Counter<long> _reservationsExpired;
    private readonly Counter<long> _circuitBreakerTrips;
    private readonly Counter<long> _rateLimitExceeded;
    private readonly Counter<long> _lockAcquisitionFailures;
    private readonly Counter<long> _sagaCompensations;

    // Histograms
    private readonly Histogram<double> _stockOperationDuration;
    private readonly Histogram<double> _lockAcquisitionDuration;

    // Gauges (via ObservableGauge)
    private static long _activeTransfers;
    private static long _pendingReservations;
    private static long _auditFallbackQueueSize;

    public InventoryMetrics()
    {
        _meter = new Meter(MeterName, "1.0.0");
        _activitySource = new ActivitySource(ActivitySourceName, "1.0.0");

        // Counters
        _stockMovementsCreated = _meter.CreateCounter<long>(
            "inventory.stock_movements.created",
            description: "Total stock movements created");

        _stockTransfersCreated = _meter.CreateCounter<long>(
            "inventory.stock_transfers.created",
            description: "Total stock transfers created");

        _adjustmentsCreated = _meter.CreateCounter<long>(
            "inventory.adjustments.created",
            description: "Total inventory adjustments created");

        _reservationsCreated = _meter.CreateCounter<long>(
            "inventory.reservations.created",
            description: "Total stock reservations created");

        _reservationsExpired = _meter.CreateCounter<long>(
            "inventory.reservations.expired",
            description: "Total stock reservations expired");

        _circuitBreakerTrips = _meter.CreateCounter<long>(
            "inventory.circuit_breaker.trips",
            description: "Total circuit breaker trips");

        _rateLimitExceeded = _meter.CreateCounter<long>(
            "inventory.rate_limit.exceeded",
            description: "Total rate limit exceeded events");

        _lockAcquisitionFailures = _meter.CreateCounter<long>(
            "inventory.locks.acquisition_failures",
            description: "Total lock acquisition failures");

        _sagaCompensations = _meter.CreateCounter<long>(
            "inventory.saga.compensations",
            description: "Total saga compensation events");

        // Histograms
        _stockOperationDuration = _meter.CreateHistogram<double>(
            "inventory.stock_operation.duration_ms",
            unit: "ms",
            description: "Duration of stock operations in milliseconds");

        _lockAcquisitionDuration = _meter.CreateHistogram<double>(
            "inventory.locks.acquisition_duration_ms",
            unit: "ms",
            description: "Duration of lock acquisition in milliseconds");

        // Observable Gauges
        _meter.CreateObservableGauge(
            "inventory.transfers.active",
            () => Interlocked.Read(ref _activeTransfers),
            description: "Number of active stock transfers");

        _meter.CreateObservableGauge(
            "inventory.reservations.pending",
            () => Interlocked.Read(ref _pendingReservations),
            description: "Number of pending stock reservations");

        _meter.CreateObservableGauge(
            "inventory.audit_fallback.queue_size",
            () => Interlocked.Read(ref _auditFallbackQueueSize),
            description: "Size of audit fallback queue");
    }

    // Counter methods
    public void RecordStockMovementCreated(string tenantId, string movementType)
        => _stockMovementsCreated.Add(1, new KeyValuePair<string, object?>("tenant_id", tenantId),
            new KeyValuePair<string, object?>("movement_type", movementType));

    public void RecordStockTransferCreated(string tenantId)
        => _stockTransfersCreated.Add(1, new KeyValuePair<string, object?>("tenant_id", tenantId));

    public void RecordAdjustmentCreated(string tenantId, string adjustmentType)
        => _adjustmentsCreated.Add(1, new KeyValuePair<string, object?>("tenant_id", tenantId),
            new KeyValuePair<string, object?>("adjustment_type", adjustmentType));

    public void RecordReservationCreated(string tenantId)
        => _reservationsCreated.Add(1, new KeyValuePair<string, object?>("tenant_id", tenantId));

    public void RecordReservationExpired(string tenantId)
        => _reservationsExpired.Add(1, new KeyValuePair<string, object?>("tenant_id", tenantId));

    public void RecordCircuitBreakerTrip(string circuitName)
        => _circuitBreakerTrips.Add(1, new KeyValuePair<string, object?>("circuit_name", circuitName));

    public void RecordRateLimitExceeded(string tenantId, string policy)
        => _rateLimitExceeded.Add(1, new KeyValuePair<string, object?>("tenant_id", tenantId),
            new KeyValuePair<string, object?>("policy", policy));

    public void RecordLockAcquisitionFailure(string resource)
        => _lockAcquisitionFailures.Add(1, new KeyValuePair<string, object?>("resource", resource));

    public void RecordSagaCompensation(string sagaName, string failedStep)
        => _sagaCompensations.Add(1, new KeyValuePair<string, object?>("saga_name", sagaName),
            new KeyValuePair<string, object?>("failed_step", failedStep));

    // Histogram methods
    public void RecordStockOperationDuration(double durationMs, string operationType)
        => _stockOperationDuration.Record(durationMs, new KeyValuePair<string, object?>("operation_type", operationType));

    public void RecordLockAcquisitionDuration(double durationMs, string resource)
        => _lockAcquisitionDuration.Record(durationMs, new KeyValuePair<string, object?>("resource", resource));

    // Gauge setters
    public static void SetActiveTransfers(long count)
        => Interlocked.Exchange(ref _activeTransfers, count);

    public static void SetPendingReservations(long count)
        => Interlocked.Exchange(ref _pendingReservations, count);

    public static void SetAuditFallbackQueueSize(long size)
        => Interlocked.Exchange(ref _auditFallbackQueueSize, size);

    // Activity/Trace methods
    public Activity? StartStockOperation(string operationName, string tenantId)
    {
        var activity = _activitySource.StartActivity(operationName, ActivityKind.Internal);
        activity?.SetTag("tenant.id", tenantId);
        activity?.SetTag("module", "inventory");
        return activity;
    }

    public Activity? StartTransferOperation(string operationName, string tenantId, int transferId)
    {
        var activity = _activitySource.StartActivity(operationName, ActivityKind.Internal);
        activity?.SetTag("tenant.id", tenantId);
        activity?.SetTag("transfer.id", transferId);
        activity?.SetTag("module", "inventory");
        return activity;
    }

    public Activity? StartExternalCall(string serviceName, string operation)
    {
        var activity = _activitySource.StartActivity($"{serviceName}.{operation}", ActivityKind.Client);
        activity?.SetTag("service.name", serviceName);
        activity?.SetTag("service.operation", operation);
        return activity;
    }
}
