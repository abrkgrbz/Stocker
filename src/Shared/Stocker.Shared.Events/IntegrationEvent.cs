using MediatR;

namespace Stocker.Shared.Events;

/// <summary>
/// Base class for all integration events in the system
/// Implements INotification for MediatR event handling
/// </summary>
public abstract record IntegrationEvent : INotification
{
    /// <summary>
    /// Unique event identifier
    /// </summary>
    public Guid EventId { get; init; } = Guid.NewGuid();

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Correlation ID for tracking related events across modules
    /// </summary>
    public string? CorrelationId { get; init; }

    /// <summary>
    /// Event version for schema evolution support
    /// </summary>
    public int Version { get; init; } = 1;
}
