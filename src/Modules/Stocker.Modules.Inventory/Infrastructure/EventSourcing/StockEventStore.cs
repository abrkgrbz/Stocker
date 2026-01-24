using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.EventSourcing;

/// <summary>
/// Stock event types for event sourcing.
/// </summary>
public enum StockEventType
{
    StockInitialized,
    StockIncreased,
    StockDecreased,
    StockReserved,
    StockReservationReleased,
    StockTransferOut,
    StockTransferIn,
    StockAdjusted,
    StockCounted,
    StockCorrected
}

/// <summary>
/// Immutable stock event representing a state change.
/// </summary>
public class StockEvent
{
    public long Id { get; init; }
    public Guid TenantId { get; init; }
    public int ProductId { get; init; }
    public int WarehouseId { get; init; }
    public StockEventType EventType { get; init; }
    public decimal Quantity { get; init; }
    public decimal BalanceAfter { get; init; }
    public string? Reference { get; init; }
    public string? UserId { get; init; }
    public string? Metadata { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public long SequenceNumber { get; init; }
}

/// <summary>
/// Stock snapshot at a point in time for efficient replay.
/// </summary>
public class StockSnapshot
{
    public int Id { get; init; }
    public Guid TenantId { get; init; }
    public int ProductId { get; init; }
    public int WarehouseId { get; init; }
    public decimal Quantity { get; init; }
    public decimal ReservedQuantity { get; init; }
    public long LastEventSequence { get; init; }
    public DateTime SnapshotAt { get; init; }
}

/// <summary>
/// Event store for stock-related events.
/// Provides append-only event log with point-in-time query support.
/// </summary>
public class StockEventStore
{
    private readonly ILogger<StockEventStore> _logger;
    private readonly List<StockEvent> _uncommittedEvents = new();

    public StockEventStore(ILogger<StockEventStore> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Append a stock event to the store.
    /// </summary>
    public StockEvent Append(Guid tenantId, int productId, int warehouseId,
        StockEventType eventType, decimal quantity, decimal balanceAfter,
        string? reference = null, string? userId = null, string? metadata = null)
    {
        var evt = new StockEvent
        {
            TenantId = tenantId,
            ProductId = productId,
            WarehouseId = warehouseId,
            EventType = eventType,
            Quantity = quantity,
            BalanceAfter = balanceAfter,
            Reference = reference,
            UserId = userId,
            Metadata = metadata,
            OccurredAt = DateTime.UtcNow,
            SequenceNumber = _uncommittedEvents.Count + 1
        };

        _uncommittedEvents.Add(evt);

        _logger.LogDebug("Stock event appended: {EventType} for Product={ProductId}, Warehouse={WarehouseId}, Qty={Quantity}",
            eventType, productId, warehouseId, quantity);

        return evt;
    }

    /// <summary>
    /// Get uncommitted events for persistence.
    /// </summary>
    public IReadOnlyList<StockEvent> GetUncommittedEvents() => _uncommittedEvents.AsReadOnly();

    /// <summary>
    /// Clear uncommitted events after successful persistence.
    /// </summary>
    public void MarkCommitted() => _uncommittedEvents.Clear();

    /// <summary>
    /// Calculate stock balance at a specific point in time from events.
    /// </summary>
    public static decimal CalculateBalanceAtTime(IEnumerable<StockEvent> events, DateTime pointInTime)
    {
        return events
            .Where(e => e.OccurredAt <= pointInTime)
            .OrderBy(e => e.SequenceNumber)
            .LastOrDefault()?.BalanceAfter ?? 0;
    }

    /// <summary>
    /// Replay events from a snapshot to rebuild current state.
    /// </summary>
    public static StockStateProjection ReplayFromSnapshot(StockSnapshot? snapshot, IEnumerable<StockEvent> events)
    {
        var state = new StockStateProjection
        {
            Quantity = snapshot?.Quantity ?? 0,
            ReservedQuantity = snapshot?.ReservedQuantity ?? 0,
            LastSequence = snapshot?.LastEventSequence ?? 0
        };

        var eventsToReplay = events
            .Where(e => e.SequenceNumber > (snapshot?.LastEventSequence ?? 0))
            .OrderBy(e => e.SequenceNumber);

        foreach (var evt in eventsToReplay)
        {
            ApplyEvent(state, evt);
        }

        return state;
    }

    private static void ApplyEvent(StockStateProjection state, StockEvent evt)
    {
        switch (evt.EventType)
        {
            case StockEventType.StockInitialized:
                state.Quantity = evt.Quantity;
                break;
            case StockEventType.StockIncreased:
            case StockEventType.StockTransferIn:
                state.Quantity += evt.Quantity;
                break;
            case StockEventType.StockDecreased:
            case StockEventType.StockTransferOut:
                state.Quantity -= evt.Quantity;
                break;
            case StockEventType.StockReserved:
                state.ReservedQuantity += evt.Quantity;
                break;
            case StockEventType.StockReservationReleased:
                state.ReservedQuantity -= evt.Quantity;
                break;
            case StockEventType.StockAdjusted:
            case StockEventType.StockCounted:
            case StockEventType.StockCorrected:
                state.Quantity = evt.BalanceAfter;
                break;
        }

        state.LastSequence = evt.SequenceNumber;
        state.EventCount++;
    }
}

/// <summary>
/// Projected stock state from event replay.
/// </summary>
public class StockStateProjection
{
    public decimal Quantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity => Quantity - ReservedQuantity;
    public long LastSequence { get; set; }
    public int EventCount { get; set; }
}

/// <summary>
/// Service for point-in-time stock queries using event sourcing.
/// </summary>
public class PointInTimeQueryService
{
    private readonly ILogger<PointInTimeQueryService> _logger;

    public PointInTimeQueryService(ILogger<PointInTimeQueryService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get stock quantity at a specific date/time.
    /// Uses event log to calculate historical state.
    /// </summary>
    public decimal GetStockAtTime(IEnumerable<StockEvent> events, DateTime pointInTime)
    {
        var balance = StockEventStore.CalculateBalanceAtTime(events, pointInTime);

        _logger.LogDebug("Point-in-time query: Balance={Balance} at {PointInTime}", balance, pointInTime);

        return balance;
    }

    /// <summary>
    /// Get stock movement history between two dates.
    /// </summary>
    public StockMovementSummaryProjection GetMovementSummary(IEnumerable<StockEvent> events, DateTime fromDate, DateTime toDate)
    {
        var periodEvents = events
            .Where(e => e.OccurredAt >= fromDate && e.OccurredAt <= toDate)
            .ToList();

        return new StockMovementSummaryProjection
        {
            FromDate = fromDate,
            ToDate = toDate,
            TotalIncoming = periodEvents
                .Where(e => e.EventType is StockEventType.StockIncreased or StockEventType.StockTransferIn)
                .Sum(e => e.Quantity),
            TotalOutgoing = periodEvents
                .Where(e => e.EventType is StockEventType.StockDecreased or StockEventType.StockTransferOut)
                .Sum(e => e.Quantity),
            TotalAdjustments = periodEvents
                .Where(e => e.EventType is StockEventType.StockAdjusted or StockEventType.StockCorrected)
                .Count(),
            EventCount = periodEvents.Count
        };
    }
}

/// <summary>
/// Stock movement summary for a period.
/// </summary>
public class StockMovementSummaryProjection
{
    public DateTime FromDate { get; init; }
    public DateTime ToDate { get; init; }
    public decimal TotalIncoming { get; init; }
    public decimal TotalOutgoing { get; init; }
    public decimal NetChange => TotalIncoming - TotalOutgoing;
    public int TotalAdjustments { get; init; }
    public int EventCount { get; init; }
}
