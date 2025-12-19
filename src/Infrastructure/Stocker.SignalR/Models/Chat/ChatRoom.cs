namespace Stocker.SignalR.Models.Chat;

/// <summary>
/// Represents a chat room
/// </summary>
public class ChatRoom
{
    /// <summary>
    /// The room name/identifier
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// List of user IDs currently in the room
    /// </summary>
    public List<string> Users { get; set; } = new();

    /// <summary>
    /// When the room was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
