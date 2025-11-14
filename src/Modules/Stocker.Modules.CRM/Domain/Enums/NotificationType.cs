namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Type of notification
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// General system notification
    /// </summary>
    System = 0,

    /// <summary>
    /// Deal-related notification
    /// </summary>
    Deal = 1,

    /// <summary>
    /// Customer-related notification
    /// </summary>
    Customer = 2,

    /// <summary>
    /// Task reminder
    /// </summary>
    Task = 3,

    /// <summary>
    /// Workflow notification
    /// </summary>
    Workflow = 4,

    /// <summary>
    /// Meeting reminder
    /// </summary>
    Meeting = 5,

    /// <summary>
    /// Alert/Warning
    /// </summary>
    Alert = 6,

    /// <summary>
    /// Success notification
    /// </summary>
    Success = 7
}
