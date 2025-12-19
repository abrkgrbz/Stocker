namespace Stocker.SignalR.Models.Notifications;

/// <summary>
/// Types of notifications
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// Informational notification
    /// </summary>
    Info,

    /// <summary>
    /// Success notification
    /// </summary>
    Success,

    /// <summary>
    /// Warning notification
    /// </summary>
    Warning,

    /// <summary>
    /// Error notification
    /// </summary>
    Error,

    /// <summary>
    /// System notification
    /// </summary>
    System,

    /// <summary>
    /// Payment-related notification
    /// </summary>
    Payment,

    /// <summary>
    /// Order-related notification
    /// </summary>
    Order,

    /// <summary>
    /// Stock-related notification
    /// </summary>
    Stock,

    /// <summary>
    /// User-related notification
    /// </summary>
    User
}
