using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using Stocker.SignalR.Constants;
using Stocker.SignalR.Models.Chat;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Interfaces;
using ChatMessageEntity = Stocker.Domain.Tenant.Entities.ChatMessage;

namespace Stocker.SignalR.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly ITenantService _tenantService;

    // In-memory tracking for online users and rooms (not persisted)
    private static readonly ConcurrentDictionary<string, ChatUser> _users = new();
    private static readonly ConcurrentDictionary<string, ChatRoom> _rooms = new();

    public ChatHub(
        ILogger<ChatHub> logger,
        IChatMessageRepository chatMessageRepository,
        ITenantService tenantService)
    {
        _logger = logger;
        _chatMessageRepository = chatMessageRepository;
        _tenantService = tenantService;
    }

    private Guid GetCurrentTenantId()
    {
        return _tenantService.GetCurrentTenantId() ?? Guid.Empty;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = Context.User?.FindFirst("UserId")?.Value
            ?? Context.User?.FindFirst("sub")?.Value
            ?? Context.UserIdentifier;

        if (Guid.TryParse(userIdClaim, out var userId))
            return userId;

        return Guid.Empty;
    }

    private string GetCurrentUserName()
    {
        return Context.User?.Identity?.Name
            ?? Context.User?.FindFirst("name")?.Value
            ?? "Unknown";
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetCurrentUserId();
        var userName = GetCurrentUserName();
        var tenantId = GetCurrentTenantId();

        if (userId != Guid.Empty)
        {
            var user = new ChatUser
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId.ToString(),
                UserName = userName,
                TenantId = tenantId.ToString(),
                ConnectedAt = DateTime.UtcNow
            };

            _users.TryAdd(Context.ConnectionId, user);

            // Join tenant's default chat room
            if (tenantId != Guid.Empty)
            {
                var roomName = SignalRGroups.ForTenant(tenantId.ToString());
                await JoinRoom(roomName);
            }

            // Notify others that user is online
            await Clients.Others.SendAsync(SignalREvents.UserOnline, new
            {
                userId = userId.ToString(),
                userName,
                connectedAt = DateTime.UtcNow
            });

            _logger.LogInformation("User {UserName} ({UserId}) connected to chat", userName, userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_users.TryRemove(Context.ConnectionId, out var user))
        {
            // Leave all rooms
            var userRooms = _rooms.Where(r => r.Value.Users.Contains(user.UserId)).Select(r => r.Key).ToList();
            foreach (var roomName in userRooms)
            {
                await LeaveRoom(roomName);
            }

            // Notify others that user is offline
            await Clients.Others.SendAsync(SignalREvents.UserOffline, new
            {
                user.UserId,
                user.UserName,
                disconnectedAt = DateTime.UtcNow
            });

            _logger.LogInformation("User {UserName} ({UserId}) disconnected from chat", user.UserName, user.UserId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string message, string? roomName = null)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var sender))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "User not found");
            return;
        }

        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty || userId == Guid.Empty)
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Authentication required");
            return;
        }

        // Create and save message to database
        var chatMessageEntity = ChatMessageEntity.CreateRoomMessage(
            tenantId,
            userId,
            sender.UserName,
            message,
            roomName ?? "global"
        );

        await _chatMessageRepository.AddAsync(chatMessageEntity);
        await _chatMessageRepository.SaveChangesAsync();

        // Create SignalR message model for broadcasting
        var chatMessage = new ChatMessage
        {
            Id = chatMessageEntity.Id,
            UserId = sender.UserId,
            UserName = sender.UserName,
            Message = message,
            Room = roomName,
            Timestamp = chatMessageEntity.SentAt
        };

        // Send message to appropriate recipients
        if (!string.IsNullOrEmpty(roomName))
        {
            await Clients.Group(roomName).SendAsync(SignalREvents.ReceiveMessage, chatMessage);
        }
        else
        {
            await Clients.All.SendAsync(SignalREvents.ReceiveMessage, chatMessage);
        }

        _logger.LogInformation("Message sent by {UserName} to {Room} and persisted to database", sender.UserName, roomName ?? "all");
    }

    public async Task SendPrivateMessage(string targetUserId, string message)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var sender))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "User not found");
            return;
        }

        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty || userId == Guid.Empty)
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Authentication required");
            return;
        }

        if (!Guid.TryParse(targetUserId, out var recipientId))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Invalid target user ID");
            return;
        }

        // Get recipient name (from online users or default)
        var targetConnection = _users.Values.FirstOrDefault(u => u.UserId == targetUserId);
        var recipientName = targetConnection?.UserName ?? "Unknown";

        // Create and save private message to database
        var chatMessageEntity = ChatMessageEntity.CreatePrivateMessage(
            tenantId,
            userId,
            sender.UserName,
            recipientId,
            recipientName,
            message
        );

        await _chatMessageRepository.AddAsync(chatMessageEntity);
        await _chatMessageRepository.SaveChangesAsync();

        var privateMessage = new ChatMessage
        {
            Id = chatMessageEntity.Id,
            UserId = sender.UserId,
            UserName = sender.UserName,
            Message = message,
            IsPrivate = true,
            TargetUserId = targetUserId,
            Timestamp = chatMessageEntity.SentAt
        };

        // Send to target user if online
        if (targetConnection != null)
        {
            await Clients.Client(targetConnection.ConnectionId).SendAsync(SignalREvents.ReceivePrivateMessage, privateMessage);
        }

        // Send confirmation to sender
        await Clients.Caller.SendAsync(SignalREvents.PrivateMessageSent, privateMessage);

        _logger.LogInformation("Private message sent from {SenderName} to {TargetUserId} and persisted to database", sender.UserName, targetUserId);
    }

    public async Task JoinRoom(string roomName)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var user))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "User not found");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

        var room = _rooms.GetOrAdd(roomName, _ => new ChatRoom
        {
            Name = roomName,
            CreatedAt = DateTime.UtcNow,
            Users = new List<string>()
        });

        lock (room.Users)
        {
            if (!room.Users.Contains(user.UserId))
            {
                room.Users.Add(user.UserId);
            }
        }

        // Load message history from database
        var tenantId = GetCurrentTenantId();
        if (tenantId != Guid.Empty)
        {
            var messages = await _chatMessageRepository.GetRoomMessagesAsync(tenantId, roomName, 20, 0);
            var recentMessages = messages
                .OrderBy(m => m.SentAt)
                .Select(m => new ChatMessage
                {
                    Id = m.Id,
                    UserId = m.SenderId.ToString(),
                    UserName = m.SenderName,
                    Message = m.Content,
                    Room = m.RoomName,
                    Timestamp = m.SentAt
                })
                .ToList();

            if (recentMessages.Any())
            {
                await Clients.Caller.SendAsync(SignalREvents.MessageHistory, recentMessages);
            }
        }

        await Clients.Group(roomName).SendAsync(SignalREvents.UserJoinedRoom, new
        {
            user.UserId,
            user.UserName,
            roomName,
            joinedAt = DateTime.UtcNow
        });

        _logger.LogInformation("User {UserName} joined room {RoomName}", user.UserName, roomName);
    }

    public async Task LeaveRoom(string roomName)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var user))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "User not found");
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);

        if (_rooms.TryGetValue(roomName, out var room))
        {
            bool shouldRemoveRoom = false;

            lock (room.Users)
            {
                room.Users.Remove(user.UserId);
                shouldRemoveRoom = room.Users.Count == 0;
            }

            // Remove room from in-memory tracking if empty
            if (shouldRemoveRoom)
            {
                _rooms.TryRemove(roomName, out _);
            }
        }

        await Clients.Group(roomName).SendAsync(SignalREvents.UserLeftRoom, new
        {
            user.UserId,
            user.UserName,
            roomName,
            leftAt = DateTime.UtcNow
        });

        _logger.LogInformation("User {UserName} left room {RoomName}", user.UserName, roomName);
    }

    public async Task GetOnlineUsers()
    {
        var onlineUsers = _users.Values.Select(u => new
        {
            u.UserId,
            u.UserName,
            u.ConnectedAt
        }).ToList();

        await Clients.Caller.SendAsync(SignalREvents.OnlineUsersList, onlineUsers);
    }

    public async Task GetRooms()
    {
        var rooms = _rooms.Select(r => new
        {
            r.Key,
            UserCount = r.Value.Users.Count,
            r.Value.CreatedAt
        }).ToList();

        await Clients.Caller.SendAsync(SignalREvents.RoomsList, rooms);
    }

    public async Task LoadPrivateMessages(string otherUserId, int take = 20, int skip = 0)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty || userId == Guid.Empty)
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Authentication required");
            return;
        }

        if (!Guid.TryParse(otherUserId, out var otherUserGuid))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Invalid user ID");
            return;
        }

        var messages = await _chatMessageRepository.GetPrivateMessagesAsync(tenantId, userId, otherUserGuid, take, skip);
        var messageList = messages
            .OrderBy(m => m.SentAt)
            .Select(m => new ChatMessage
            {
                Id = m.Id,
                UserId = m.SenderId.ToString(),
                UserName = m.SenderName,
                Message = m.Content,
                IsPrivate = true,
                TargetUserId = m.RecipientId?.ToString(),
                Timestamp = m.SentAt
            })
            .ToList();

        await Clients.Caller.SendAsync(SignalREvents.PrivateMessageHistory, messageList);
    }

    public async Task MarkMessagesAsRead(IEnumerable<Guid> messageIds)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty || userId == Guid.Empty)
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Authentication required");
            return;
        }

        await _chatMessageRepository.MarkAsReadAsync(tenantId, userId, messageIds.ToList());

        await Clients.Caller.SendAsync(SignalREvents.MessagesMarkedAsRead, messageIds);
    }

    public async Task GetUnreadCount()
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty || userId == Guid.Empty)
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Authentication required");
            return;
        }

        var count = await _chatMessageRepository.GetUnreadCountAsync(tenantId, userId);
        await Clients.Caller.SendAsync(SignalREvents.UnreadCount, count);
    }

    public async Task StartTyping(string? roomName = null)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var user))
            return;

        var typingInfo = new
        {
            user.UserId,
            user.UserName,
            roomName
        };

        if (!string.IsNullOrEmpty(roomName))
        {
            await Clients.OthersInGroup(roomName).SendAsync(SignalREvents.UserTyping, typingInfo);
        }
        else
        {
            await Clients.Others.SendAsync(SignalREvents.UserTyping, typingInfo);
        }
    }

    public async Task StopTyping(string? roomName = null)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var user))
            return;

        var typingInfo = new
        {
            user.UserId,
            user.UserName,
            roomName
        };

        if (!string.IsNullOrEmpty(roomName))
        {
            await Clients.OthersInGroup(roomName).SendAsync(SignalREvents.UserStoppedTyping, typingInfo);
        }
        else
        {
            await Clients.Others.SendAsync(SignalREvents.UserStoppedTyping, typingInfo);
        }
    }
}
