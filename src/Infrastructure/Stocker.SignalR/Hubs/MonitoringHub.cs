using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace Stocker.SignalR.Hubs;

/// <summary>
/// Real-time system monitoring hub for admin dashboard
/// </summary>
[Authorize(Roles = "SistemYoneticisi")]
public class MonitoringHub : Hub
{
    private readonly ILogger<MonitoringHub> _logger;
    private static readonly ConcurrentDictionary<string, MonitoringConnection> _connections = new();

    public MonitoringHub(ILogger<MonitoringHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.User?.FindFirst("UserId")?.Value;
        var tenantId = Context.User?.FindFirst("TenantId")?.Value;
        var userRole = Context.User?.FindFirst("Role")?.Value ?? Context.User?.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            var connection = new MonitoringConnection
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                TenantId = tenantId,
                UserRole = userRole,
                ConnectedAt = DateTime.UtcNow
            };

            _connections.TryAdd(Context.ConnectionId, connection);

            // Add to admin monitoring group (only system admins)
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin-monitoring");

            // Add to tenant-specific monitoring if applicable
            if (!string.IsNullOrEmpty(tenantId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"monitoring-tenant-{tenantId}");
            }

            _logger.LogInformation(
                "Monitoring client connected: {ConnectionId} for User: {UserId} (Role: {Role})",
                Context.ConnectionId, userId, userRole);

            // Send connection confirmation with initial settings
            await Clients.Caller.SendAsync("MonitoringConnected", new
            {
                connectionId = Context.ConnectionId,
                message = "Connected to monitoring hub",
                timestamp = DateTime.UtcNow,
                refreshInterval = 15000 // Default 15 seconds
            });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connections.TryRemove(Context.ConnectionId, out var connection))
        {
            // Remove from groups
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admin-monitoring");

            if (!string.IsNullOrEmpty(connection.TenantId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"monitoring-tenant-{connection.TenantId}");
            }

            _logger.LogInformation(
                "Monitoring client disconnected: {ConnectionId} for User: {UserId}. Reason: {Reason}",
                Context.ConnectionId, connection.UserId, exception?.Message ?? "Client disconnected");
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Subscribe to system metrics updates
    /// </summary>
    public async Task SubscribeToSystemMetrics()
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "system-metrics");

            _logger.LogInformation("Client {ConnectionId} subscribed to system metrics", Context.ConnectionId);

            await Clients.Caller.SendAsync("SubscriptionConfirmed", new
            {
                subscription = "system-metrics",
                message = "Successfully subscribed to system metrics",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to system metrics");
            await Clients.Caller.SendAsync("SubscriptionError", new
            {
                error = "Failed to subscribe to system metrics",
                details = ex.Message
            });
        }
    }

    /// <summary>
    /// Unsubscribe from system metrics updates
    /// </summary>
    public async Task UnsubscribeFromSystemMetrics()
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "system-metrics");

            _logger.LogInformation("Client {ConnectionId} unsubscribed from system metrics", Context.ConnectionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unsubscribing from system metrics");
        }
    }

    /// <summary>
    /// Subscribe to service health updates
    /// </summary>
    public async Task SubscribeToServiceHealth()
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "service-health");

            _logger.LogInformation("Client {ConnectionId} subscribed to service health", Context.ConnectionId);

            await Clients.Caller.SendAsync("SubscriptionConfirmed", new
            {
                subscription = "service-health",
                message = "Successfully subscribed to service health",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to service health");
            await Clients.Caller.SendAsync("SubscriptionError", new
            {
                error = "Failed to subscribe to service health",
                details = ex.Message
            });
        }
    }

    /// <summary>
    /// Subscribe to alert notifications
    /// </summary>
    public async Task SubscribeToAlerts()
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "monitoring-alerts");

            _logger.LogInformation("Client {ConnectionId} subscribed to alerts", Context.ConnectionId);

            await Clients.Caller.SendAsync("SubscriptionConfirmed", new
            {
                subscription = "monitoring-alerts",
                message = "Successfully subscribed to alerts",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to alerts");
            await Clients.Caller.SendAsync("SubscriptionError", new
            {
                error = "Failed to subscribe to alerts",
                details = ex.Message
            });
        }
    }

    /// <summary>
    /// Request immediate metrics update
    /// </summary>
    public async Task RequestMetricsUpdate()
    {
        try
        {
            _logger.LogInformation("Client {ConnectionId} requested metrics update", Context.ConnectionId);

            // This will trigger the background job to send an immediate update
            // In production, this could call ISystemMonitoringService directly
            await Clients.Caller.SendAsync("MetricsUpdateRequested", new
            {
                message = "Metrics update requested",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting metrics update");
        }
    }

    /// <summary>
    /// Get active monitoring connections count
    /// </summary>
    public async Task GetConnectionsCount()
    {
        var count = _connections.Count;
        await Clients.Caller.SendAsync("ConnectionsCount", new
        {
            count = count,
            timestamp = DateTime.UtcNow
        });
    }
}

/// <summary>
/// Monitoring connection information
/// </summary>
public class MonitoringConnection
{
    public string ConnectionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? TenantId { get; set; }
    public string? UserRole { get; set; }
    public DateTime ConnectedAt { get; set; }
}