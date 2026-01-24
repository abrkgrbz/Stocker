using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Integration;

/// <summary>
/// Outbox message representing a pending integration event.
/// Stored alongside domain transactions for guaranteed delivery.
/// </summary>
public class OutboxMessage
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public string EventType { get; init; } = string.Empty;
    public string PayloadJson { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public int RetryCount { get; set; }
    public string? Error { get; set; }
    public OutboxMessageStatus Status { get; set; } = OutboxMessageStatus.Pending;
    public string? CorrelationId { get; init; }
    public string? AggregateId { get; init; }
    public string? AggregateType { get; init; }
}

/// <summary>
/// Outbox message status.
/// </summary>
public enum OutboxMessageStatus
{
    Pending,
    Processing,
    Processed,
    Failed
}

/// <summary>
/// In-memory outbox for transactional event publishing.
/// Guarantees that integration events are published at-least-once
/// by storing them alongside the domain transaction.
/// </summary>
public class OutboxProcessor
{
    private readonly ILogger<OutboxProcessor> _logger;
    private readonly ConcurrentQueue<OutboxMessage> _pendingMessages = new();
    private readonly ConcurrentDictionary<Guid, OutboxMessage> _allMessages = new();
    private const int MaxRetries = 5;
    private const int MaxHistorySize = 2000;

    public OutboxProcessor(ILogger<OutboxProcessor> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Add a message to the outbox. Called within the same transaction as domain changes.
    /// </summary>
    public OutboxMessage Add(Guid tenantId, string eventType, string payloadJson,
        string? correlationId = null, string? aggregateId = null, string? aggregateType = null)
    {
        var message = new OutboxMessage
        {
            TenantId = tenantId,
            EventType = eventType,
            PayloadJson = payloadJson,
            CorrelationId = correlationId,
            AggregateId = aggregateId,
            AggregateType = aggregateType
        };

        _pendingMessages.Enqueue(message);
        _allMessages[message.Id] = message;

        // Trim history
        while (_allMessages.Count > MaxHistorySize)
        {
            var oldest = _allMessages.Values
                .Where(m => m.Status == OutboxMessageStatus.Processed)
                .OrderBy(m => m.ProcessedAt)
                .FirstOrDefault();
            if (oldest != null)
                _allMessages.TryRemove(oldest.Id, out _);
            else
                break;
        }

        _logger.LogDebug(
            "Outbox message added: {MessageId}, Type={EventType}, Aggregate={AggregateType}/{AggregateId}",
            message.Id, eventType, aggregateType, aggregateId);

        return message;
    }

    /// <summary>
    /// Get batch of pending messages for processing.
    /// </summary>
    public IReadOnlyList<OutboxMessage> GetPendingBatch(int batchSize = 50)
    {
        var batch = new List<OutboxMessage>();
        var now = DateTime.UtcNow;

        var tempQueue = new ConcurrentQueue<OutboxMessage>();

        while (batch.Count < batchSize && _pendingMessages.TryDequeue(out var message))
        {
            if (message.Status == OutboxMessageStatus.Pending)
            {
                message.Status = OutboxMessageStatus.Processing;
                batch.Add(message);
            }
            else
            {
                tempQueue.Enqueue(message);
            }
        }

        // Re-enqueue remaining
        while (tempQueue.TryDequeue(out var remaining))
        {
            _pendingMessages.Enqueue(remaining);
        }

        return batch.AsReadOnly();
    }

    /// <summary>
    /// Mark a message as successfully processed.
    /// </summary>
    public void MarkProcessed(Guid messageId)
    {
        if (_allMessages.TryGetValue(messageId, out var message))
        {
            message.Status = OutboxMessageStatus.Processed;
            message.ProcessedAt = DateTime.UtcNow;

            _logger.LogDebug(
                "Outbox message processed: {MessageId}, Type={EventType}",
                messageId, message.EventType);
        }
    }

    /// <summary>
    /// Mark a message as failed. Re-enqueues if retries remain.
    /// </summary>
    public void MarkFailed(Guid messageId, string error)
    {
        if (!_allMessages.TryGetValue(messageId, out var message))
            return;

        message.RetryCount++;
        message.Error = error;

        if (message.RetryCount >= MaxRetries)
        {
            message.Status = OutboxMessageStatus.Failed;
            _logger.LogWarning(
                "Outbox message permanently failed: {MessageId}, Type={EventType}, Error={Error}",
                messageId, message.EventType, error);
        }
        else
        {
            message.Status = OutboxMessageStatus.Pending;
            _pendingMessages.Enqueue(message);
            _logger.LogInformation(
                "Outbox message requeued: {MessageId}, attempt {Attempt}/{MaxRetries}",
                messageId, message.RetryCount, MaxRetries);
        }
    }

    /// <summary>
    /// Get outbox statistics.
    /// </summary>
    public OutboxStats GetStats()
    {
        var all = _allMessages.Values.ToList();

        return new OutboxStats
        {
            PendingCount = all.Count(m => m.Status == OutboxMessageStatus.Pending),
            ProcessingCount = all.Count(m => m.Status == OutboxMessageStatus.Processing),
            ProcessedCount = all.Count(m => m.Status == OutboxMessageStatus.Processed),
            FailedCount = all.Count(m => m.Status == OutboxMessageStatus.Failed),
            TotalMessages = all.Count
        };
    }

    /// <summary>
    /// Get failed messages for manual inspection/retry.
    /// </summary>
    public IReadOnlyList<OutboxMessage> GetFailedMessages()
    {
        return _allMessages.Values
            .Where(m => m.Status == OutboxMessageStatus.Failed)
            .OrderByDescending(m => m.CreatedAt)
            .ToList()
            .AsReadOnly();
    }

    /// <summary>
    /// Retry a specific failed message.
    /// </summary>
    public bool RetryFailed(Guid messageId)
    {
        if (!_allMessages.TryGetValue(messageId, out var message))
            return false;

        if (message.Status != OutboxMessageStatus.Failed)
            return false;

        message.Status = OutboxMessageStatus.Pending;
        message.RetryCount = 0;
        message.Error = null;
        _pendingMessages.Enqueue(message);

        _logger.LogInformation("Outbox message manually retried: {MessageId}", messageId);
        return true;
    }

    /// <summary>
    /// Get pending count for metrics.
    /// </summary>
    public int PendingCount => _pendingMessages.Count;
}

/// <summary>
/// Outbox statistics.
/// </summary>
public class OutboxStats
{
    public int PendingCount { get; init; }
    public int ProcessingCount { get; init; }
    public int ProcessedCount { get; init; }
    public int FailedCount { get; init; }
    public int TotalMessages { get; init; }
}
