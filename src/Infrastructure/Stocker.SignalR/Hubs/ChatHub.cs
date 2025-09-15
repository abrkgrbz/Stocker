using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

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
                var roomName = $"tenant-{tenantId}";
                await JoinRoom(roomName);
            }

            // Notify others that user is online
            await Clients.Others.SendAsync("UserOnline", new
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
            await Clients.Others.SendAsync("UserOffline", new
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
            await Clients.Caller.SendAsync("Error", "User not found");
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

        // Store message in history
        var historyKey = roomName ?? "global";
        if (!_messageHistory.ContainsKey(historyKey))
        {
            _messageHistory[historyKey] = new List<ChatMessage>();
        }
        _messageHistory[historyKey].Add(chatMessage);

        // Keep only last 100 messages per room
        if (_messageHistory[historyKey].Count > 100)
        {
            _messageHistory[historyKey].RemoveAt(0);
        }

        // Send message to appropriate recipients
        if (!string.IsNullOrEmpty(roomName))
        {
            await Clients.Group(roomName).SendAsync("ReceiveMessage", chatMessage);
        }
        else
        {
            await Clients.All.SendAsync("ReceiveMessage", chatMessage);
        }

        _logger.LogInformation("Message sent by {UserName} to {Room}", sender.UserName, roomName ?? "all");
    }

    public async Task SendPrivateMessage(string targetUserId, string message)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var sender))
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }

        var targetConnection = _users.Values.FirstOrDefault(u => u.UserId == targetUserId);
        if (targetConnection == null)
        {
            await Clients.Caller.SendAsync("Error", "Target user not online");
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
        await Clients.Client(targetConnection.ConnectionId).SendAsync("ReceivePrivateMessage", privateMessage);
        
        // Send confirmation to sender
        await Clients.Caller.SendAsync("PrivateMessageSent", privateMessage);

        _logger.LogInformation("Private message sent from {SenderName} to {TargetUserId}", sender.UserName, targetUserId);
    }

    public async Task JoinRoom(string roomName)
    {
        if (!_users.TryGetValue(Context.ConnectionId, out var user))
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

        if (!_rooms.ContainsKey(roomName))
        {
            _rooms[roomName] = new ChatRoom
            {
                Name = roomName,
                CreatedAt = DateTime.UtcNow,
                Users = new List<string>()
            };
        }

        if (!_rooms[roomName].Users.Contains(user.UserId))
        {
            _rooms[roomName].Users.Add(user.UserId);
        }

        // Send recent message history to the user
        if (_messageHistory.ContainsKey(roomName))
        {
            var recentMessages = _messageHistory[roomName].TakeLast(20).ToList();
            await Clients.Caller.SendAsync("MessageHistory", recentMessages);
        }

        await Clients.Group(roomName).SendAsync("UserJoinedRoom", new
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
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);

        if (_rooms.ContainsKey(roomName))
        {
            _rooms[roomName].Users.Remove(user.UserId);
            
            // Remove room if empty
            if (_rooms[roomName].Users.Count == 0)
            {
                _rooms.TryRemove(roomName, out _);
            }
        }

        await Clients.Group(roomName).SendAsync("UserLeftRoom", new
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

        await Clients.Caller.SendAsync("OnlineUsersList", onlineUsers);
    }

    public async Task GetRooms()
    {
        var rooms = _rooms.Select(r => new
        {
            r.Key,
            UserCount = r.Value.Users.Count,
            r.Value.CreatedAt
        }).ToList();

        await Clients.Caller.SendAsync("RoomsList", rooms);
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
            await Clients.OthersInGroup(roomName).SendAsync("UserTyping", typingInfo);
        }
        else
        {
            await Clients.Others.SendAsync("UserTyping", typingInfo);
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
            await Clients.OthersInGroup(roomName).SendAsync("UserStoppedTyping", typingInfo);
        }
        else
        {
            await Clients.Others.SendAsync("UserStoppedTyping", typingInfo);
        }
    }
}

#region DTOs

public class ChatUser
{
    public string ConnectionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? TenantId { get; set; }
    public DateTime ConnectedAt { get; set; }
}

public class ChatRoom
{
    public string Name { get; set; } = string.Empty;
    public List<string> Users { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ChatMessage
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Room { get; set; }
    public bool IsPrivate { get; set; }
    public string? TargetUserId { get; set; }
    public DateTime Timestamp { get; set; }
}

#endregion