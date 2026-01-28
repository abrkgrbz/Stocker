using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.SignalR.Constants;
using Stocker.SignalR.Hubs;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.SignalR.Services;

/// <summary>
/// Unified notification service implementing all segregated notification interfaces.
/// Provides methods for sending notifications to users, tenants, groups, roles, and broadcasts.
/// </summary>
public class NotificationService :
    Interfaces.INotificationService,
    IUserNotificationService,
    ITenantNotificationService,
    IBroadcastNotificationService,
    IGroupNotificationService,
    IRoleNotificationService,
    ITenantRoleNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<NotificationHub> hubContext,
        IConnectionManager connectionManager,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _connectionManager = connectionManager;
        _logger = logger;
    }

    public async Task SendToUserAsync(string userId, object notification)
    {
        try
        {
            var connections = _connectionManager.GetConnections(userId);
            if (connections.Any())
            {
                await _hubContext.Clients
                    .Clients(connections)
                    .SendAsync(SignalREvents.ReceiveNotification, notification);
                
                _logger.LogInformation("Notification sent to user {UserId}", userId);
            }
            else
            {
                _logger.LogWarning("No active connections found for user {UserId}", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
            throw;
        }
    }

    public async Task SendToGroupAsync(string groupName, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(groupName)
                .SendAsync(SignalREvents.ReceiveNotification, notification);
            
            _logger.LogInformation("Notification sent to group {GroupName}", groupName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to group {GroupName}", groupName);
            throw;
        }
    }

    public async Task SendToTenantAsync(string tenantId, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(SignalRGroups.ForTenant(tenantId))
                .SendAsync(SignalREvents.ReceiveNotification, notification);
            
            _logger.LogInformation("Notification sent to tenant {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task SendToAllAsync(object notification)
    {
        try
        {
            await _hubContext.Clients
                .All
                .SendAsync(SignalREvents.ReceiveNotification, notification);
            
            _logger.LogInformation("Notification broadcasted to all users");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
            throw;
        }
    }

    public async Task SendToRoleAsync(string role, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(SignalRGroups.ForRole(role))
                .SendAsync(SignalREvents.ReceiveNotification, notification);

            _logger.LogInformation("Notification sent to role: Role={Role}", role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to role: Role={Role}", role);
            throw;
        }
    }

    #region Extended Interface Implementations

    /// <inheritdoc />
    public async Task SendToUserAsync(string userId, string eventName, object notification)
    {
        try
        {
            var connections = _connectionManager.GetConnections(userId);
            if (connections.Any())
            {
                await _hubContext.Clients
                    .Clients(connections)
                    .SendAsync(eventName, notification);

                _logger.LogInformation("Custom notification sent to user: UserId={UserId}, Event={Event}", userId, eventName);
            }
            else
            {
                _logger.LogWarning("No active connections found for user: UserId={UserId}", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending custom notification to user: UserId={UserId}, Event={Event}", userId, eventName);
            throw;
        }
    }

    /// <inheritdoc />
    public bool IsUserOnline(string userId)
    {
        return _connectionManager.IsUserOnline(userId);
    }

    /// <inheritdoc />
    public async Task SendToTenantAsync(string tenantId, string eventName, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(SignalRGroups.ForTenant(tenantId))
                .SendAsync(eventName, notification);

            _logger.LogInformation("Custom notification sent to tenant: TenantId={TenantId}, Event={Event}", tenantId, eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending custom notification to tenant: TenantId={TenantId}, Event={Event}", tenantId, eventName);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task SendToAllAsync(string eventName, object notification)
    {
        try
        {
            await _hubContext.Clients
                .All
                .SendAsync(eventName, notification);

            _logger.LogInformation("Custom notification broadcasted to all users: Event={Event}", eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting custom notification: Event={Event}", eventName);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task SendToGroupAsync(string groupName, string eventName, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(groupName)
                .SendAsync(eventName, notification);

            _logger.LogInformation("Custom notification sent to group: GroupName={GroupName}, Event={Event}", groupName, eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending custom notification to group: GroupName={GroupName}, Event={Event}", groupName, eventName);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task SendToRoleAsync(string role, string eventName, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(SignalRGroups.ForRole(role))
                .SendAsync(eventName, notification);

            _logger.LogInformation("Custom notification sent to role: Role={Role}, Event={Event}", role, eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending custom notification to role: Role={Role}, Event={Event}", role, eventName);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task SendToTenantRoleAsync(
        Guid tenantId,
        string role,
        string title,
        string message,
        string notificationType,
        Dictionary<string, object>? metadata = null)
    {
        try
        {
            // Create a structured notification payload for background job notifications
            var notification = new
            {
                Title = title,
                Message = message,
                Type = notificationType,
                TenantId = tenantId,
                Role = role,
                Timestamp = DateTime.UtcNow,
                Metadata = metadata ?? new Dictionary<string, object>()
            };

            // Send to combined tenant-role group
            var groupName = SignalRGroups.ForTenantRole(tenantId.ToString(), role);

            await _hubContext.Clients
                .Group(groupName)
                .SendAsync(SignalREvents.ReceiveNotification, notification);

            _logger.LogInformation(
                "Notification sent to tenant role: TenantId={TenantId}, Role={Role}, Type={Type}",
                tenantId, role, notificationType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error sending notification to tenant role: TenantId={TenantId}, Role={Role}, Type={Type}",
                tenantId, role, notificationType);
            // Don't throw - notifications are non-critical for background jobs
        }
    }

    #endregion
}