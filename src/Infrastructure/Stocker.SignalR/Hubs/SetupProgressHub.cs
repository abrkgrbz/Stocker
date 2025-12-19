using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Stocker.SignalR.Constants;

namespace Stocker.SignalR.Hubs;

/// <summary>
/// Real-time hub for setup/provisioning progress notifications
/// Allows tracking tenant database creation, migration, and seeding progress
/// </summary>
[AllowAnonymous] // Setup happens before full authentication
public class SetupProgressHub : Hub
{
    private readonly ILogger<SetupProgressHub> _logger;

    public SetupProgressHub(ILogger<SetupProgressHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("SetupProgressHub client connected: ConnectionId={ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("SetupProgressHub client disconnected: ConnectionId={ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a setup progress group to receive updates for a specific tenant setup
    /// </summary>
    public async Task JoinSetupGroup(Guid tenantId)
    {
        var groupName = SignalRGroups.ForSetup(tenantId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        await Clients.Caller.SendAsync(SignalREvents.JoinedSetupGroup, new
        {
            tenantId,
            groupName,
            message = "Subscribed to setup progress updates"
        });

        _logger.LogInformation("Connection {ConnectionId} joined setup group for tenant {TenantId}",
            Context.ConnectionId, tenantId);
    }

    /// <summary>
    /// Leave a setup progress group
    /// </summary>
    public async Task LeaveSetupGroup(Guid tenantId)
    {
        var groupName = SignalRGroups.ForSetup(tenantId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Caller.SendAsync(SignalREvents.LeftSetupGroup, new
        {
            tenantId,
            groupName,
            message = "Unsubscribed from setup progress updates"
        });

        _logger.LogInformation("Connection {ConnectionId} left setup group for tenant {TenantId}",
            Context.ConnectionId, tenantId);
    }

    /// <summary>
    /// Get the group name for a tenant's setup progress
    /// </summary>
    public static string GetGroupName(Guid tenantId) => SignalRGroups.ForSetup(tenantId);
}
