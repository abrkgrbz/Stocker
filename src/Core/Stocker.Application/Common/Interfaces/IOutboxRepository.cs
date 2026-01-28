using Stocker.Domain.Common.Entities;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Repository interface for outbox message operations.
/// Used by the outbox processor to retrieve and update messages.
/// </summary>
public interface IOutboxRepository
{
    /// <summary>
    /// Adds a new outbox message
    /// </summary>
    Task AddAsync(OutboxMessage message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds multiple outbox messages
    /// </summary>
    Task AddRangeAsync(IEnumerable<OutboxMessage> messages, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unprocessed messages for processing
    /// </summary>
    /// <param name="batchSize">Maximum number of messages to retrieve</param>
    Task<IReadOnlyList<OutboxMessage>> GetUnprocessedAsync(int batchSize = 20, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a message after processing attempt
    /// </summary>
    Task UpdateAsync(OutboxMessage message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes old processed messages for cleanup
    /// </summary>
    /// <param name="olderThan">Delete messages processed before this date</param>
    Task<int> DeleteProcessedAsync(DateTime olderThan, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets failed messages for monitoring/retry
    /// </summary>
    Task<IReadOnlyList<OutboxMessage>> GetFailedAsync(int batchSize = 100, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets message count by status for monitoring
    /// </summary>
    Task<OutboxMessageStats> GetStatsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Statistics for outbox messages
/// </summary>
public record OutboxMessageStats(
    int PendingCount,
    int ProcessedCount,
    int FailedCount,
    DateTime? OldestPendingDate);
