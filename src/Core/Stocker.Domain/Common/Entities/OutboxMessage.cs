using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Common.Entities;

/// <summary>
/// Outbox message entity for reliable domain event delivery.
/// Events are first persisted to the outbox table within the same transaction,
/// then processed by a background job that publishes them to handlers.
/// </summary>
public sealed class OutboxMessage : Entity
{
    /// <summary>
    /// The fully qualified type name of the domain event
    /// </summary>
    public string Type { get; private set; }

    /// <summary>
    /// JSON-serialized content of the domain event
    /// </summary>
    public string Content { get; private set; }

    /// <summary>
    /// When the event originally occurred
    /// </summary>
    public DateTime OccurredOnUtc { get; private set; }

    /// <summary>
    /// When the message was processed (published to handlers)
    /// Null if not yet processed
    /// </summary>
    public DateTime? ProcessedOnUtc { get; private set; }

    /// <summary>
    /// Error message if processing failed
    /// </summary>
    public string? Error { get; private set; }

    /// <summary>
    /// Number of processing attempts
    /// </summary>
    public int RetryCount { get; private set; }

    /// <summary>
    /// Maximum retry attempts before marking as failed
    /// </summary>
    public const int MaxRetryAttempts = 3;

    // EF Core constructor
    private OutboxMessage()
    {
        Type = string.Empty;
        Content = string.Empty;
    }

    private OutboxMessage(Guid id, string type, string content, DateTime occurredOnUtc)
    {
        Id = id;
        Type = type;
        Content = content;
        OccurredOnUtc = occurredOnUtc;
        RetryCount = 0;
    }

    /// <summary>
    /// Creates a new outbox message from a domain event
    /// </summary>
    public static OutboxMessage Create(Guid eventId, string eventType, string serializedContent, DateTime occurredOnUtc)
    {
        if (string.IsNullOrWhiteSpace(eventType))
            throw new ArgumentException("Event type cannot be empty", nameof(eventType));

        if (string.IsNullOrWhiteSpace(serializedContent))
            throw new ArgumentException("Serialized content cannot be empty", nameof(serializedContent));

        return new OutboxMessage(eventId, eventType, serializedContent, occurredOnUtc);
    }

    /// <summary>
    /// Marks the message as successfully processed
    /// </summary>
    public void MarkAsProcessed()
    {
        ProcessedOnUtc = DateTime.UtcNow;
        Error = null;
    }

    /// <summary>
    /// Marks the message as failed with an error
    /// </summary>
    public void MarkAsFailed(string error)
    {
        RetryCount++;
        Error = error;

        // If max retries reached, mark as processed to stop retrying
        if (RetryCount >= MaxRetryAttempts)
        {
            ProcessedOnUtc = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Checks if the message can be retried
    /// </summary>
    public bool CanRetry() => RetryCount < MaxRetryAttempts && ProcessedOnUtc == null;

    /// <summary>
    /// Checks if the message is pending processing
    /// </summary>
    public bool IsPending() => ProcessedOnUtc == null;

    /// <summary>
    /// Checks if the message failed permanently
    /// </summary>
    public bool IsFailed() => ProcessedOnUtc != null && !string.IsNullOrEmpty(Error);
}
