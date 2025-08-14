using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.SignalR.Hubs;

namespace Stocker.SignalR.Services;

public interface INotificationService
{
    Task SendToUserAsync(string userId, object notification);
    Task SendToGroupAsync(string groupName, object notification);
    Task SendToTenantAsync(string tenantId, object notification);
    Task SendToAllAsync(object notification);
    Task SendToRoleAsync(string role, object notification);
}

public class NotificationService : INotificationService
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
                    .SendAsync("ReceiveNotification", notification);
                
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
                .SendAsync("ReceiveNotification", notification);
            
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
                .Group($"tenant-{tenantId}")
                .SendAsync("ReceiveNotification", notification);
            
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
                .SendAsync("ReceiveNotification", notification);
            
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
                .Group($"role-{role}")
                .SendAsync("ReceiveNotification", notification);
            
            _logger.LogInformation("Notification sent to role {Role}", role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to role {Role}", role);
            throw;
        }
    }
}