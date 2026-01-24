using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Integration;

/// <summary>
/// Retry queue item representing a failed operation to be retried.
/// </summary>
public class RetryQueueItem
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string OperationType { get; init; } = string.Empty;
    public string PayloadJson { get; init; } = string.Empty;
    public Guid TenantId { get; init; }
    public int AttemptCount { get; set; }
    public int MaxAttempts { get; init; } = 5;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime NextRetryAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastAttemptAt { get; set; }
    public string? LastError { get; set; }
    public RetryItemStatus Status { get; set; } = RetryItemStatus.Pending;
    public string? CorrelationId { get; init; }
}

/// <summary>
/// Status of a retry queue item.
/// </summary>
public enum RetryItemStatus
{
    Pending,
    Processing,
    Completed,
    DeadLettered,
    Cancelled
}

/// <summary>
/// Dead letter entry for permanently failed operations.
/// </summary>
public class DeadLetterEntry
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public RetryQueueItem OriginalItem { get; init; } = null!;
    public string Reason { get; init; } = string.Empty;
    public DateTime DeadLetteredAt { get; init; } = DateTime.UtcNow;
    public bool Requeued { get; set; }
}

/// <summary>
/// In-memory retry queue with dead letter support.
/// Provides reliable retry semantics for failed integration operations.
/// </summary>
public class RetryQueue
{
    private readonly ILogger<RetryQueue> _logger;
    private readonly ConcurrentQueue<RetryQueueItem> _queue = new();
    private readonly ConcurrentDictionary<Guid, RetryQueueItem> _processing = new();
    private readonly ConcurrentQueue<DeadLetterEntry> _deadLetterQueue = new();
    private readonly ConcurrentDictionary<Guid, RetryQueueItem> _allItems = new();
    private const int MaxDeadLetterSize = 500;

    public RetryQueue(ILogger<RetryQueue> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Enqueue an item for retry.
    /// </summary>
    public RetryQueueItem Enqueue(string operationType, string payloadJson, Guid tenantId,
        int maxAttempts = 5, string? correlationId = null)
    {
        var item = new RetryQueueItem
        {
            OperationType = operationType,
            PayloadJson = payloadJson,
            TenantId = tenantId,
            MaxAttempts = maxAttempts,
            CorrelationId = correlationId
        };

        _queue.Enqueue(item);
        _allItems[item.Id] = item;

        _logger.LogInformation(
            "Retry queue item enqueued: {ItemId}, Type={OperationType}, Tenant={TenantId}",
            item.Id, operationType, tenantId);

        return item;
    }

    /// <summary>
    /// Dequeue next ready item for processing.
    /// Returns null if no items are ready.
    /// </summary>
    public RetryQueueItem? Dequeue()
    {
        var now = DateTime.UtcNow;

        // Try to find items ready for retry
        var tempQueue = new ConcurrentQueue<RetryQueueItem>();
        RetryQueueItem? result = null;

        while (_queue.TryDequeue(out var item))
        {
            if (result == null && item.Status == RetryItemStatus.Pending && item.NextRetryAt <= now)
            {
                item.Status = RetryItemStatus.Processing;
                _processing[item.Id] = item;
                result = item;
            }
            else
            {
                tempQueue.Enqueue(item);
            }
        }

        // Re-enqueue items that weren't taken
        while (tempQueue.TryDequeue(out var remaining))
        {
            _queue.Enqueue(remaining);
        }

        return result;
    }

    /// <summary>
    /// Mark an item as completed successfully.
    /// </summary>
    public void Complete(Guid itemId)
    {
        if (_processing.TryRemove(itemId, out var item))
        {
            item.Status = RetryItemStatus.Completed;
            _logger.LogInformation(
                "Retry queue item completed: {ItemId} after {Attempts} attempts",
                itemId, item.AttemptCount);
        }
    }

    /// <summary>
    /// Mark an item as failed. Requeues if retries remain, otherwise dead-letters.
    /// </summary>
    public void Fail(Guid itemId, string errorMessage)
    {
        if (!_processing.TryRemove(itemId, out var item))
            return;

        item.AttemptCount++;
        item.LastAttemptAt = DateTime.UtcNow;
        item.LastError = errorMessage;

        if (item.AttemptCount >= item.MaxAttempts)
        {
            // Move to dead letter queue
            item.Status = RetryItemStatus.DeadLettered;
            var deadLetter = new DeadLetterEntry
            {
                OriginalItem = item,
                Reason = $"Max attempts ({item.MaxAttempts}) exhausted. Last error: {errorMessage}"
            };

            _deadLetterQueue.Enqueue(deadLetter);
            while (_deadLetterQueue.Count > MaxDeadLetterSize)
                _deadLetterQueue.TryDequeue(out _);

            _logger.LogWarning(
                "Retry queue item dead-lettered: {ItemId}, Type={OperationType}, Attempts={Attempts}",
                itemId, item.OperationType, item.AttemptCount);
        }
        else
        {
            // Calculate next retry with exponential backoff
            var backoffSeconds = Math.Pow(2, item.AttemptCount) * 5; // 10s, 20s, 40s, 80s, 160s
            item.NextRetryAt = DateTime.UtcNow.AddSeconds(backoffSeconds);
            item.Status = RetryItemStatus.Pending;

            _queue.Enqueue(item);

            _logger.LogInformation(
                "Retry queue item requeued: {ItemId}, attempt {Attempt}/{MaxAttempts}, next retry at {NextRetry}",
                itemId, item.AttemptCount, item.MaxAttempts, item.NextRetryAt);
        }
    }

    /// <summary>
    /// Re-queue a dead letter item for another round of attempts.
    /// </summary>
    public bool RequeueDeadLetter(Guid deadLetterId)
    {
        var entries = _deadLetterQueue.ToArray();
        var entry = entries.FirstOrDefault(e => e.Id == deadLetterId);

        if (entry == null || entry.Requeued)
            return false;

        entry.Requeued = true;
        var item = entry.OriginalItem;
        item.AttemptCount = 0;
        item.Status = RetryItemStatus.Pending;
        item.NextRetryAt = DateTime.UtcNow;

        _queue.Enqueue(item);

        _logger.LogInformation(
            "Dead letter item requeued: {ItemId}, Type={OperationType}",
            item.Id, item.OperationType);

        return true;
    }

    /// <summary>
    /// Get queue statistics.
    /// </summary>
    public RetryQueueStats GetStats()
    {
        var allItems = _allItems.Values.ToList();

        return new RetryQueueStats
        {
            PendingCount = _queue.Count,
            ProcessingCount = _processing.Count,
            CompletedCount = allItems.Count(i => i.Status == RetryItemStatus.Completed),
            DeadLetteredCount = _deadLetterQueue.Count,
            TotalEnqueued = allItems.Count
        };
    }

    /// <summary>
    /// Get dead letter entries for inspection.
    /// </summary>
    public IReadOnlyList<DeadLetterEntry> GetDeadLetters(int count = 50)
    {
        return _deadLetterQueue.ToArray()
            .OrderByDescending(d => d.DeadLetteredAt)
            .Take(count)
            .ToList()
            .AsReadOnly();
    }

    /// <summary>
    /// Get current queue depth (for metrics/observability).
    /// </summary>
    public int QueueDepth => _queue.Count + _processing.Count;
}

/// <summary>
/// Retry queue statistics.
/// </summary>
public class RetryQueueStats
{
    public int PendingCount { get; init; }
    public int ProcessingCount { get; init; }
    public int CompletedCount { get; init; }
    public int DeadLetteredCount { get; init; }
    public int TotalEnqueued { get; init; }
}
