using Microsoft.EntityFrameworkCore;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Repositories.Tenant;

public class ChatMessageRepository : IChatMessageRepository
{
    private readonly TenantDbContext _context;

    public ChatMessageRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<ChatMessage?> GetByIdAsync(Guid id, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.ChatMessages
            .FirstOrDefaultAsync(m => m.Id == id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken);
    }

    public async Task<List<ChatMessage>> GetRoomMessagesAsync(
        Guid tenantId,
        string roomName,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        return await _context.ChatMessages
            .Where(m => m.TenantId == tenantId && m.RoomName == roomName && !m.IsDeleted && !m.IsPrivate)
            .OrderByDescending(m => m.SentAt)
            .Skip(skip)
            .Take(take)
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ChatMessage>> GetPrivateMessagesAsync(
        Guid tenantId,
        Guid userId1,
        Guid userId2,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        return await _context.ChatMessages
            .Where(m => m.TenantId == tenantId
                && m.IsPrivate
                && !m.IsDeleted
                && ((m.SenderId == userId1 && m.RecipientId == userId2)
                    || (m.SenderId == userId2 && m.RecipientId == userId1)))
            .OrderByDescending(m => m.SentAt)
            .Skip(skip)
            .Take(take)
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.ChatMessages
            .Where(m => m.TenantId == tenantId
                && m.RecipientId == userId
                && !m.IsRead
                && !m.IsDeleted)
            .CountAsync(cancellationToken);
    }

    public async Task<List<ChatConversation>> GetConversationsAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // Private conversations
        var privateConversations = await _context.ChatMessages
            .Where(m => m.TenantId == tenantId
                && m.IsPrivate
                && !m.IsDeleted
                && (m.SenderId == userId || m.RecipientId == userId))
            .GroupBy(m => m.SenderId == userId ? m.RecipientId : m.SenderId)
            .Select(g => new ChatConversation
            {
                UserId = g.Key ?? Guid.Empty,
                UserName = g.OrderByDescending(m => m.SentAt).First().SenderId == userId
                    ? g.OrderByDescending(m => m.SentAt).First().RecipientName ?? ""
                    : g.OrderByDescending(m => m.SentAt).First().SenderName,
                IsPrivate = true,
                LastMessage = g.OrderByDescending(m => m.SentAt).FirstOrDefault(),
                UnreadCount = g.Count(m => m.RecipientId == userId && !m.IsRead)
            })
            .ToListAsync(cancellationToken);

        // Room conversations (rooms the user has participated in)
        var roomConversations = await _context.ChatMessages
            .Where(m => m.TenantId == tenantId
                && !m.IsPrivate
                && !m.IsDeleted
                && m.RoomName != null)
            .GroupBy(m => m.RoomName)
            .Select(g => new ChatConversation
            {
                RoomName = g.Key,
                IsPrivate = false,
                LastMessage = g.OrderByDescending(m => m.SentAt).FirstOrDefault(),
                UnreadCount = 0 // Room messages don't have individual read status
            })
            .ToListAsync(cancellationToken);

        return privateConversations.Concat(roomConversations)
            .OrderByDescending(c => c.LastMessage?.SentAt ?? DateTime.MinValue)
            .ToList();
    }

    public async Task<List<string>> GetRoomsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.ChatMessages
            .Where(m => m.TenantId == tenantId && !m.IsPrivate && !m.IsDeleted && m.RoomName != null)
            .Select(m => m.RoomName!)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        await _context.ChatMessages.AddAsync(message, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        _context.ChatMessages.Update(message);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(ChatMessage message, CancellationToken cancellationToken = default)
    {
        message.Delete();
        _context.ChatMessages.Update(message);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAsReadAsync(Guid tenantId, Guid userId, IEnumerable<Guid> messageIds, CancellationToken cancellationToken = default)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.TenantId == tenantId
                && m.RecipientId == userId
                && messageIds.Contains(m.Id)
                && !m.IsRead
                && !m.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            message.MarkAsRead();
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
