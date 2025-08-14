using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace Stocker.SignalR.Hubs;

/// <summary>
/// Real-time notification hub for system notifications
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;
    private static readonly ConcurrentDictionary<string, UserConnection> _connections = new();

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.User?.FindFirst("UserId")?.Value;
        var tenantId = Context.User?.FindFirst("TenantId")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            var connection = new UserConnection
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                TenantId = tenantId,
                ConnectedAt = DateTime.UtcNow
            };

            _connections.TryAdd(Context.ConnectionId, connection);

            // Add user to tenant group if applicable
            if (!string.IsNullOrEmpty(tenantId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant-{tenantId}");
            }

            // Add user to their personal group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

            _logger.LogInformation("User {UserId} connected with ConnectionId: {ConnectionId}", userId, Context.ConnectionId);

            // Send connection confirmation
            await Clients.Caller.SendAsync("Connected", new
            {
                connectionId = Context.ConnectionId,
                message = "Connected to notification hub"
            });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connections.TryRemove(Context.ConnectionId, out var connection))
        {
            // Remove from groups
            if (!string.IsNullOrEmpty(connection.TenantId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant-{connection.TenantId}");
            }
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{connection.UserId}");

            _logger.LogInformation("User {UserId} disconnected", connection.UserId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Send notification to specific user
    /// </summary>
    [Authorize(Roles = "SystemAdmin,TenantAdmin")]
    public async Task SendToUser(string userId, NotificationMessage notification)
    {
        try
        {
            await Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", notification);
            _logger.LogInformation("Notification sent to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Send notification to all users in a tenant
    /// </summary>
    [Authorize(Roles = "SystemAdmin,TenantAdmin")]
    public async Task SendToTenant(string tenantId, NotificationMessage notification)
    {
        try
        {
            await Clients.Group($"tenant-{tenantId}").SendAsync("ReceiveNotification", notification);
            _logger.LogInformation("Notification sent to tenant {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to tenant {TenantId}", tenantId);
            throw;
        }
    }

    /// <summary>
    /// Broadcast notification to all connected users
    /// </summary>
    [Authorize(Roles = "SystemAdmin")]
    public async Task BroadcastNotification(NotificationMessage notification)
    {
        try
        {
            await Clients.All.SendAsync("ReceiveNotification", notification);
            _logger.LogInformation("Notification broadcasted to all users");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
            throw;
        }
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    public async Task MarkAsRead(Guid notificationId)
    {
        try
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst("UserId")?.Value;
            
            // TODO: Update notification status in database
            
            await Clients.Caller.SendAsync("NotificationRead", new
            {
                notificationId,
                readAt = DateTime.UtcNow
            });

            _logger.LogInformation("Notification {NotificationId} marked as read by user {UserId}", notificationId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read");
            throw;
        }
    }

    /// <summary>
    /// Get online users count
    /// </summary>
    [Authorize(Roles = "SystemAdmin,TenantAdmin")]
    public async Task GetOnlineUsers()
    {
        try
        {
            var tenantId = Context.User?.FindFirst("TenantId")?.Value;
            
            var users = tenantId != null
                ? _connections.Values.Where(c => c.TenantId == tenantId).ToList()
                : _connections.Values.ToList();

            await Clients.Caller.SendAsync("OnlineUsers", new
            {
                count = users.Count,
                users = users.Select(u => new
                {
                    u.UserId,
                    u.ConnectedAt
                })
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting online users");
            throw;
        }
    }

    /// <summary>
    /// Join a custom notification group
    /// </summary>
    public async Task JoinGroup(string groupName)
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("JoinedGroup", groupName);
            _logger.LogInformation("Connection {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining group {GroupName}", groupName);
            throw;
        }
    }

    /// <summary>
    /// Leave a custom notification group
    /// </summary>
    public async Task LeaveGroup(string groupName)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Caller.SendAsync("LeftGroup", groupName);
            _logger.LogInformation("Connection {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving group {GroupName}", groupName);
            throw;
        }
    }
}

#region DTOs

public class UserConnection
{
    public string ConnectionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? TenantId { get; set; }
    public DateTime ConnectedAt { get; set; }
}

public class NotificationMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; }
    public Dictionary<string, object>? Data { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ActionUrl { get; set; }
    public string? Icon { get; set; }
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error,
    System,
    Payment,
    Order,
    Stock,
    User
}

public enum NotificationPriority
{
    Low,
    Normal,
    High,
    Urgent
}

#endregion