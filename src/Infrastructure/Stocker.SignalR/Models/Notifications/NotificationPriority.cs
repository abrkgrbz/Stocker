namespace Stocker.SignalR.Models.Notifications;

/// <summary>
/// Priority levels for notifications
/// </summary>
public enum NotificationPriority
{
    /// <summary>
    /// Low priority - can be delayed or batched
    /// </summary>
    Low,

    /// <summary>
    /// Normal priority - standard delivery
    /// </summary>
    Normal,

    /// <summary>
    /// High priority - deliver promptly
    /// </summary>
    High,

    /// <summary>
    /// Urgent priority - deliver immediately
    /// </summary>
    Urgent
}
