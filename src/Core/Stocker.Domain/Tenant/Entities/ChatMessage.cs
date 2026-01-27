using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Chat mesajları - tenant içi kullanıcılar arası mesajlaşma
/// Hem oda mesajları hem de özel mesajları destekler
/// </summary>
public sealed class ChatMessage : TenantEntity
{
    public Guid SenderId { get; private set; }
    public string SenderName { get; private set; }
    public string Content { get; private set; }
    public string? RoomName { get; private set; }
    public Guid? RecipientId { get; private set; }
    public string? RecipientName { get; private set; }
    public bool IsPrivate { get; private set; }
    public DateTime SentAt { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    public string? DeletedBy { get; private set; }
    public ChatMessageType MessageType { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public string? AttachmentName { get; private set; }

    private ChatMessage() { } // EF Constructor

    /// <summary>
    /// Oda mesajı oluşturur
    /// </summary>
    public static ChatMessage CreateRoomMessage(
        Guid tenantId,
        Guid senderId,
        string senderName,
        string content,
        string roomName,
        ChatMessageType messageType = ChatMessageType.Text,
        string? attachmentUrl = null,
        string? attachmentName = null)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Message content cannot be empty.", nameof(content));
        if (string.IsNullOrWhiteSpace(roomName))
            throw new ArgumentException("Room name cannot be empty.", nameof(roomName));

        return new ChatMessage
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            SenderName = senderName ?? throw new ArgumentNullException(nameof(senderName)),
            Content = content,
            RoomName = roomName,
            IsPrivate = false,
            SentAt = DateTime.UtcNow,
            IsRead = false,
            IsDeleted = false,
            MessageType = messageType,
            AttachmentUrl = attachmentUrl,
            AttachmentName = attachmentName
        }.WithTenant(tenantId);
    }

    /// <summary>
    /// Özel mesaj oluşturur
    /// </summary>
    public static ChatMessage CreatePrivateMessage(
        Guid tenantId,
        Guid senderId,
        string senderName,
        Guid recipientId,
        string recipientName,
        string content,
        ChatMessageType messageType = ChatMessageType.Text,
        string? attachmentUrl = null,
        string? attachmentName = null)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Message content cannot be empty.", nameof(content));

        return new ChatMessage
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            SenderName = senderName ?? throw new ArgumentNullException(nameof(senderName)),
            RecipientId = recipientId,
            RecipientName = recipientName ?? throw new ArgumentNullException(nameof(recipientName)),
            Content = content,
            IsPrivate = true,
            SentAt = DateTime.UtcNow,
            IsRead = false,
            IsDeleted = false,
            MessageType = messageType,
            AttachmentUrl = attachmentUrl,
            AttachmentName = attachmentName
        }.WithTenant(tenantId);
    }

    private ChatMessage WithTenant(Guid tenantId)
    {
        SetTenantId(tenantId);
        return this;
    }

    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }
    }

    public void MarkAsUnread()
    {
        IsRead = false;
        ReadAt = null;
    }

    public void Delete(string? deletedBy = null)
    {
        if (!IsDeleted)
        {
            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            DeletedBy = deletedBy;
        }
    }
}

/// <summary>
/// Chat mesaj türleri
/// </summary>
public enum ChatMessageType
{
    Text = 0,
    Image = 1,
    File = 2,
    System = 3  // Kullanıcı katıldı, ayrıldı vb. sistem mesajları
}
