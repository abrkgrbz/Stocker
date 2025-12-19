using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using Stocker.SignalR.Constants;
using Stocker.SignalR.Models.Chat;

namespace Stocker.SignalR.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private static readonly ConcurrentDictionary<string, ChatUser> _users = new();
    private static readonly ConcurrentDictionary<string, ChatRoom> _rooms = new();
    private static readonly ConcurrentDictionary<string, List<ChatMessage>> _messageHistory = new();

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.User?.FindFirst("UserId")?.Value;
        var userName = Context.User?.Identity?.Name ?? "Unknown";
        var tenantId = Context.User?.FindFirst("TenantId")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            var user = new ChatUser
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                UserName = userName,
                TenantId = tenantId,
                ConnectedAt = DateTime.UtcNow
            };

            _users.TryAdd(Context.ConnectionId, user);

            // Join tenant's default chat room
            if (!string.IsNullOrEmpty(tenantId))
            {
                var roomName = SignalRGroups.ForTenant(tenantId);
                await JoinRoom(roomName);
            }

            // Notify others that user is online
            await Clients.Others.SendAsync(SignalREvents.UserOnline, new
            {
                userId,
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

        var chatMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            UserId = sender.UserId,
            UserName = sender.UserName,
            Message = message,
            Room = roomName,
            Timestamp = DateTime.UtcNow
        };

        // Store message in history using thread-safe pattern
        var historyKey = roomName ?? "global";
        var messages = _messageHistory.GetOrAdd(historyKey, _ => new List<ChatMessage>());

        lock (messages)
        {
            messages.Add(chatMessage);

            // Keep only last 100 messages per room
            while (messages.Count > 100)
            {
                messages.RemoveAt(0);
            }
        }

        // Send message to appropriate recipients
        if (!string.IsNullOrEmpty(roomName))
        {
            await Clients.Group(roomName).SendAsync(SignalREvents.ReceiveMessage, chatMessage);
        }
        else
        {
            await Clients.All.SendAsync(SignalREvents.ReceiveMessage, chatMessage);
        }

        _logger.LogInformation("Message sent by {UserName} to {Room}", sender.UserName, roomName ?? "all");
    }

    public async Task SendPrivateMessage(string targetUserId, string message)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var sender))
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "User not found");
            return;
        }

        var targetConnection = _users.Values.FirstOrDefault(u => u.UserId == targetUserId);
        if (targetConnection == null)
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, "Target user not online");
            return;
        }

        var privateMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            UserId = sender.UserId,
            UserName = sender.UserName,
            Message = message,
            IsPrivate = true,
            TargetUserId = targetUserId,
            Timestamp = DateTime.UtcNow
        };

        // Send to target user
        await Clients.Client(targetConnection.ConnectionId).SendAsync(SignalREvents.ReceivePrivateMessage, privateMessage);

        // Send confirmation to sender
        await Clients.Caller.SendAsync(SignalREvents.PrivateMessageSent, privateMessage);

        _logger.LogInformation("Private message sent from {SenderName} to {TargetUserId}", sender.UserName, targetUserId);
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

        // Send recent message history to the user
        if (_messageHistory.TryGetValue(roomName, out var history))
        {
            List<ChatMessage> recentMessages;
            lock (history)
            {
                recentMessages = history.TakeLast(20).ToList();
            }
            await Clients.Caller.SendAsync(SignalREvents.MessageHistory, recentMessages);
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

            // Remove room if empty and also clean up message history
            if (shouldRemoveRoom)
            {
                _rooms.TryRemove(roomName, out _);
                _messageHistory.TryRemove(roomName, out _);
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
