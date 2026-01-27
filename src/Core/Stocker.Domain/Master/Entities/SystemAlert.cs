using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// System alert for monitoring and operational notifications
/// </summary>
public sealed class SystemAlert : Entity
{
    public string Type { get; private set; }
    public AlertSeverity Severity { get; private set; }
    public string Title { get; private set; }
    public string Message { get; private set; }
    public string Source { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime Timestamp { get; private set; }
    public string? AcknowledgedBy { get; private set; }
    public DateTime? AcknowledgedAt { get; private set; }
    public string? DismissedBy { get; private set; }
    public DateTime? DismissedAt { get; private set; }
    public string? Metadata { get; private set; } // JSON for additional data

    private SystemAlert() : base() { } // EF Core

    private SystemAlert(
        string type,
        AlertSeverity severity,
        string title,
        string message,
        string source) : base(Guid.NewGuid())
    {
        Type = type;
        Severity = severity;
        Title = title;
        Message = message;
        Source = source;
        IsActive = true;
        Timestamp = DateTime.UtcNow;
    }

    public static SystemAlert Create(
        string type,
        AlertSeverity severity,
        string title,
        string message,
        string source,
        string? metadata = null)
    {
        if (string.IsNullOrWhiteSpace(type))
            throw new ArgumentException("Alert type cannot be empty", nameof(type));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Alert title cannot be empty", nameof(title));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Alert message cannot be empty", nameof(message));

        var alert = new SystemAlert(type, severity, title, message, source)
        {
            Metadata = metadata
        };

        return alert;
    }

    /// <summary>
    /// Acknowledge the alert
    /// </summary>
    public void Acknowledge(string acknowledgedBy)
    {
        if (string.IsNullOrWhiteSpace(acknowledgedBy))
            throw new ArgumentException("AcknowledgedBy cannot be empty", nameof(acknowledgedBy));

        if (AcknowledgedAt.HasValue)
            throw new InvalidOperationException("Alert has already been acknowledged");

        AcknowledgedBy = acknowledgedBy;
        AcknowledgedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Dismiss/close the alert
    /// </summary>
    public void Dismiss(string dismissedBy)
    {
        if (string.IsNullOrWhiteSpace(dismissedBy))
            throw new ArgumentException("DismissedBy cannot be empty", nameof(dismissedBy));

        if (!IsActive)
            throw new InvalidOperationException("Alert is already dismissed");

        DismissedBy = dismissedBy;
        DismissedAt = DateTime.UtcNow;
        IsActive = false;
    }

    /// <summary>
    /// Reactivate a dismissed alert
    /// </summary>
    public void Reactivate()
    {
        if (IsActive)
            throw new InvalidOperationException("Alert is already active");

        IsActive = true;
        DismissedBy = null;
        DismissedAt = null;
    }

    /// <summary>
    /// Update the alert message
    /// </summary>
    public void UpdateMessage(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message cannot be empty", nameof(message));

        Message = message;
    }

    /// <summary>
    /// Update metadata
    /// </summary>
    public SystemAlert WithMetadata(string jsonMetadata)
    {
        Metadata = jsonMetadata;
        return this;
    }
}
