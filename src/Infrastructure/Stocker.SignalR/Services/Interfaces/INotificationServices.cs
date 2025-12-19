namespace Stocker.SignalR.Services.Interfaces;

/// <summary>
/// Interface for sending notifications to individual users.
/// Follows Interface Segregation Principle - only user-specific operations.
/// </summary>
public interface IUserNotificationService
{
    /// <summary>
    /// Sends a notification to a specific user
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <param name="notification">The notification payload</param>
    Task SendToUserAsync(string userId, object notification);

    /// <summary>
    /// Sends a notification to a specific user with a custom event name
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <param name="eventName">The event name for the notification</param>
    /// <param name="notification">The notification payload</param>
    Task SendToUserAsync(string userId, string eventName, object notification);

    /// <summary>
    /// Checks if a user is currently online
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>True if the user has active connections</returns>
    bool IsUserOnline(string userId);
}

/// <summary>
/// Interface for sending notifications to tenants.
/// Follows Interface Segregation Principle - only tenant-specific operations.
/// </summary>
public interface ITenantNotificationService
{
    /// <summary>
    /// Sends a notification to all users in a tenant
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="notification">The notification payload</param>
    Task SendToTenantAsync(string tenantId, object notification);

    /// <summary>
    /// Sends a notification to all users in a tenant with a custom event name
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="eventName">The event name for the notification</param>
    /// <param name="notification">The notification payload</param>
    Task SendToTenantAsync(string tenantId, string eventName, object notification);
}

/// <summary>
/// Interface for sending broadcast notifications.
/// Follows Interface Segregation Principle - only broadcast operations.
/// </summary>
public interface IBroadcastNotificationService
{
    /// <summary>
    /// Sends a notification to all connected users
    /// </summary>
    /// <param name="notification">The notification payload</param>
    Task SendToAllAsync(object notification);

    /// <summary>
    /// Sends a notification to all connected users with a custom event name
    /// </summary>
    /// <param name="eventName">The event name for the notification</param>
    /// <param name="notification">The notification payload</param>
    Task SendToAllAsync(string eventName, object notification);
}

/// <summary>
/// Interface for sending notifications to groups.
/// Follows Interface Segregation Principle - only group-specific operations.
/// </summary>
public interface IGroupNotificationService
{
    /// <summary>
    /// Sends a notification to a specific group
    /// </summary>
    /// <param name="groupName">The group name</param>
    /// <param name="notification">The notification payload</param>
    Task SendToGroupAsync(string groupName, object notification);

    /// <summary>
    /// Sends a notification to a specific group with a custom event name
    /// </summary>
    /// <param name="groupName">The group name</param>
    /// <param name="eventName">The event name for the notification</param>
    /// <param name="notification">The notification payload</param>
    Task SendToGroupAsync(string groupName, string eventName, object notification);
}

/// <summary>
/// Interface for sending notifications to roles.
/// Follows Interface Segregation Principle - only role-specific operations.
/// </summary>
public interface IRoleNotificationService
{
    /// <summary>
    /// Sends a notification to all users with a specific role
    /// </summary>
    /// <param name="role">The role name</param>
    /// <param name="notification">The notification payload</param>
    Task SendToRoleAsync(string role, object notification);

    /// <summary>
    /// Sends a notification to all users with a specific role with a custom event name
    /// </summary>
    /// <param name="role">The role name</param>
    /// <param name="eventName">The event name for the notification</param>
    /// <param name="notification">The notification payload</param>
    Task SendToRoleAsync(string role, string eventName, object notification);
}

/// <summary>
/// Combined interface for all notification operations.
/// Use this when you need access to all notification capabilities.
/// Prefer using the specific interfaces when possible for better dependency management.
/// </summary>
public interface INotificationService :
    IUserNotificationService,
    ITenantNotificationService,
    IBroadcastNotificationService,
    IGroupNotificationService,
    IRoleNotificationService
{
}
