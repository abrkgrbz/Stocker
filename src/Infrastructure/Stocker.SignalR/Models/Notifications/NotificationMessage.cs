namespace Stocker.SignalR.Models.Notifications;

/// <summary>
/// Represents a notification message
/// </summary>
public class NotificationMessage
{
    /// <summary>
    /// Unique notification identifier
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The notification title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The notification message content
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The type of notification
    /// </summary>
    public NotificationType Type { get; set; }

    /// <summary>
    /// The priority level of the notification
    /// </summary>
    public NotificationPriority Priority { get; set; }

    /// <summary>
    /// Additional data associated with the notification
    /// </summary>
    public Dictionary<string, object>? Data { get; set; }

    /// <summary>
    /// When the notification was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional URL for the notification action
    /// </summary>
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Optional icon for the notification
    /// </summary>
    public string? Icon { get; set; }
}
