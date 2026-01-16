using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Interfaces.Repositories;

public interface IChatMessageRepository
{
    Task<ChatMessage?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirli bir odanın mesajlarını getirir
    /// </summary>
    Task<List<ChatMessage>> GetRoomMessagesAsync(
        Guid tenantId,
        string roomName,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// İki kullanıcı arasındaki özel mesajları getirir
    /// </summary>
    Task<List<ChatMessage>> GetPrivateMessagesAsync(
        Guid tenantId,
        Guid userId1,
        Guid userId2,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirli bir kullanıcının okunmamış mesaj sayısını getirir
    /// </summary>
    Task<int> GetUnreadCountAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirli bir kullanıcının tüm konuşmalarını getirir (son mesajlarla birlikte)
    /// </summary>
    Task<List<ChatConversation>> GetConversationsAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Tenant'taki tüm odaları getirir
    /// </summary>
    Task<List<string>> GetRoomsAsync(Guid tenantId, CancellationToken cancellationToken = default);

    Task AddAsync(ChatMessage message, CancellationToken cancellationToken = default);
    Task UpdateAsync(ChatMessage message, CancellationToken cancellationToken = default);
    Task DeleteAsync(ChatMessage message, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Birden fazla mesajı okundu olarak işaretler
    /// </summary>
    Task MarkAsReadAsync(Guid tenantId, Guid userId, IEnumerable<Guid> messageIds, CancellationToken cancellationToken = default);
}

/// <summary>
/// Konuşma özeti (son mesaj ve okunmamış sayısı ile birlikte)
/// </summary>
public class ChatConversation
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? RoomName { get; set; }
    public bool IsPrivate { get; set; }
    public ChatMessage? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}
