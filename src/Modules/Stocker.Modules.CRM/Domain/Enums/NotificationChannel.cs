namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Channel through which notification is delivered
/// </summary>
public enum NotificationChannel
{
    /// <summary>
    /// In-app notification via SignalR
    /// </summary>
    InApp = 0,

    /// <summary>
    /// Email notification
    /// </summary>
    Email = 1,

    /// <summary>
    /// SMS notification
    /// </summary>
    SMS = 2,

    /// <summary>
    /// Browser push notification
    /// </summary>
    Push = 3,

    /// <summary>
    /// WhatsApp message
    /// </summary>
    WhatsApp = 4
}
