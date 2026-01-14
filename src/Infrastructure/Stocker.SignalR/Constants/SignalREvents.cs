namespace Stocker.SignalR.Constants;

/// <summary>
/// Centralized SignalR client event names.
/// All SendAsync calls should use these constants for consistency.
/// </summary>
public static class SignalREvents
{
    #region Common Events

    /// <summary>
    /// Generic connection confirmation event
    /// </summary>
    public const string Connected = "Connected";

    /// <summary>
    /// Generic error event for client-side error handling
    /// </summary>
    public const string Error = "Error";

    /// <summary>
    /// Domain event occurred (for real-time monitoring)
    /// </summary>
    public const string DomainEventOccurred = "DomainEventOccurred";

    #endregion

    #region Notification Events

    /// <summary>
    /// Receive a notification message
    /// </summary>
    public const string ReceiveNotification = "ReceiveNotification";

    /// <summary>
    /// Notification has been marked as read
    /// </summary>
    public const string NotificationRead = "NotificationRead";

    /// <summary>
    /// Joined a notification group
    /// </summary>
    public const string JoinedGroup = "JoinedGroup";

    /// <summary>
    /// Left a notification group
    /// </summary>
    public const string LeftGroup = "LeftGroup";

    /// <summary>
    /// Joined a registration tracking group
    /// </summary>
    public const string JoinedRegistrationGroup = "JoinedRegistrationGroup";

    /// <summary>
    /// Left a registration tracking group
    /// </summary>
    public const string LeftRegistrationGroup = "LeftRegistrationGroup";

    #endregion

    #region Tenant Events

    /// <summary>
    /// New tenant has been created (admin notification)
    /// </summary>
    public const string TenantCreated = "TenantCreated";

    /// <summary>
    /// Tenant is ready for use (registration completion)
    /// </summary>
    public const string TenantReady = "TenantReady";

    /// <summary>
    /// Tenant creation progress update
    /// </summary>
    public const string TenantCreationProgress = "TenantCreationProgress";

    #endregion

    #region Chat Events

    /// <summary>
    /// User came online
    /// </summary>
    public const string UserOnline = "UserOnline";

    /// <summary>
    /// User went offline
    /// </summary>
    public const string UserOffline = "UserOffline";

    /// <summary>
    /// Receive a chat message
    /// </summary>
    public const string ReceiveMessage = "ReceiveMessage";

    /// <summary>
    /// Receive a private/direct message
    /// </summary>
    public const string ReceivePrivateMessage = "ReceivePrivateMessage";

    /// <summary>
    /// Confirmation that private message was sent
    /// </summary>
    public const string PrivateMessageSent = "PrivateMessageSent";

    /// <summary>
    /// Message history for a room
    /// </summary>
    public const string MessageHistory = "MessageHistory";

    /// <summary>
    /// User joined a chat room
    /// </summary>
    public const string UserJoinedRoom = "UserJoinedRoom";

    /// <summary>
    /// User left a chat room
    /// </summary>
    public const string UserLeftRoom = "UserLeftRoom";

    /// <summary>
    /// List of online users
    /// </summary>
    public const string OnlineUsersList = "OnlineUsersList";

    /// <summary>
    /// List of online users (alternative name)
    /// </summary>
    public const string OnlineUsers = "OnlineUsers";

    /// <summary>
    /// List of available rooms
    /// </summary>
    public const string RoomsList = "RoomsList";

    /// <summary>
    /// User started typing
    /// </summary>
    public const string UserTyping = "UserTyping";

    /// <summary>
    /// User stopped typing
    /// </summary>
    public const string UserStoppedTyping = "UserStoppedTyping";

    #endregion

    #region Monitoring Events

    /// <summary>
    /// Monitoring connection established
    /// </summary>
    public const string MonitoringConnected = "MonitoringConnected";

    /// <summary>
    /// Subscription to monitoring topic confirmed
    /// </summary>
    public const string SubscriptionConfirmed = "SubscriptionConfirmed";

    /// <summary>
    /// Subscription error occurred
    /// </summary>
    public const string SubscriptionError = "SubscriptionError";

    /// <summary>
    /// Metrics update requested/received
    /// </summary>
    public const string MetricsUpdateRequested = "MetricsUpdateRequested";

    /// <summary>
    /// Current connections count
    /// </summary>
    public const string ConnectionsCount = "ConnectionsCount";

    #endregion

    #region Setup Progress Events

    /// <summary>
    /// Joined setup progress tracking group
    /// </summary>
    public const string JoinedSetupGroup = "JoinedSetupGroup";

    /// <summary>
    /// Left setup progress tracking group
    /// </summary>
    public const string LeftSetupGroup = "LeftSetupGroup";

    /// <summary>
    /// Setup progress update
    /// </summary>
    public const string SetupProgress = "SetupProgress";

    #endregion

    #region Pricing Events

    /// <summary>
    /// Price calculation completed
    /// </summary>
    public const string PriceCalculated = "PriceCalculated";

    #endregion

    #region Validation Events

    /// <summary>
    /// Email validation result
    /// </summary>
    public const string EmailValidated = "EmailValidated";

    /// <summary>
    /// Email exists check result
    /// </summary>
    public const string EmailExistsChecked = "EmailExistsChecked";

    /// <summary>
    /// Password strength check result
    /// </summary>
    public const string PasswordStrengthChecked = "PasswordStrengthChecked";

    /// <summary>
    /// Domain availability check result
    /// </summary>
    public const string DomainChecked = "DomainChecked";

    /// <summary>
    /// Phone validation result
    /// </summary>
    public const string PhoneValidated = "PhoneValidated";

    /// <summary>
    /// Company name check result
    /// </summary>
    public const string CompanyNameChecked = "CompanyNameChecked";

    /// <summary>
    /// Tenant code validation result
    /// </summary>
    public const string TenantCodeValidated = "TenantCodeValidated";

    /// <summary>
    /// Identity (TC/Tax) validation result
    /// </summary>
    public const string IdentityValidated = "IdentityValidated";

    /// <summary>
    /// Validation error occurred
    /// </summary>
    public const string ValidationError = "ValidationError";

    #endregion
}
