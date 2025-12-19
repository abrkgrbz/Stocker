namespace Stocker.SignalR.Models.Notifications;

/// <summary>
/// Represents a connected user in the notification system
/// </summary>
public class UserConnection
{
    /// <summary>
    /// The SignalR connection ID
    /// </summary>
    public string ConnectionId { get; set; } = string.Empty;

    /// <summary>
    /// The user's unique identifier
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// The tenant ID the user belongs to (if applicable)
    /// </summary>
    public string? TenantId { get; set; }

    /// <summary>
    /// When the user connected
    /// </summary>
    public DateTime ConnectedAt { get; set; }
}
