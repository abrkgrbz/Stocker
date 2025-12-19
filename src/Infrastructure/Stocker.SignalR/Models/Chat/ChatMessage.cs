namespace Stocker.SignalR.Models.Chat;

/// <summary>
/// Represents a chat message
/// </summary>
public class ChatMessage
{
    /// <summary>
    /// Unique message identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The sender's user ID
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// The sender's display name
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// The message content
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The room the message was sent to (null for global messages)
    /// </summary>
    public string? Room { get; set; }

    /// <summary>
    /// Whether this is a private/direct message
    /// </summary>
    public bool IsPrivate { get; set; }

    /// <summary>
    /// The target user ID for private messages
    /// </summary>
    public string? TargetUserId { get; set; }

    /// <summary>
    /// When the message was sent
    /// </summary>
    public DateTime Timestamp { get; set; }
}
