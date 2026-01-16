using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.DTOs.Tenant.Chat;

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? RoomName { get; set; }
    public Guid? RecipientId { get; set; }
    public string? RecipientName { get; set; }
    public bool IsPrivate { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public ChatMessageType MessageType { get; set; }
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }

    public static ChatMessageDto FromEntity(ChatMessage entity)
    {
        return new ChatMessageDto
        {
            Id = entity.Id,
            SenderId = entity.SenderId,
            SenderName = entity.SenderName,
            Content = entity.Content,
            RoomName = entity.RoomName,
            RecipientId = entity.RecipientId,
            RecipientName = entity.RecipientName,
            IsPrivate = entity.IsPrivate,
            SentAt = entity.SentAt,
            IsRead = entity.IsRead,
            ReadAt = entity.ReadAt,
            MessageType = entity.MessageType,
            AttachmentUrl = entity.AttachmentUrl,
            AttachmentName = entity.AttachmentName
        };
    }
}

public class ChatConversationDto
{
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? RoomName { get; set; }
    public bool IsPrivate { get; set; }
    public ChatMessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}

public class SendMessageDto
{
    public string Content { get; set; } = string.Empty;
    public string? RoomName { get; set; }
    public Guid? RecipientId { get; set; }
    public bool IsPrivate { get; set; }
    public ChatMessageType MessageType { get; set; } = ChatMessageType.Text;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
}

public class ChatRoomDto
{
    public string Name { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public int MessageCount { get; set; }
    public DateTime? LastMessageAt { get; set; }
}
