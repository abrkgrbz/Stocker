namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Status of notification delivery
/// </summary>
public enum NotificationStatus
{
    /// <summary>
    /// Notification created but not sent yet
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Notification successfully sent
    /// </summary>
    Sent = 1,

    /// <summary>
    /// Notification delivery failed
    /// </summary>
    Failed = 2,

    /// <summary>
    /// Notification cancelled before sending
    /// </summary>
    Cancelled = 3
}
