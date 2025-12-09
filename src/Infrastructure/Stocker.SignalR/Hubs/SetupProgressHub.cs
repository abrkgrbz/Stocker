using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

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
        _logger.LogInformation("Setup progress client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Setup progress client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a setup progress group to receive updates for a specific tenant setup
    /// </summary>
    public async Task JoinSetupGroup(Guid tenantId)
    {
        var groupName = GetGroupName(tenantId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        await Clients.Caller.SendAsync("JoinedSetupGroup", new
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
        var groupName = GetGroupName(tenantId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Caller.SendAsync("LeftSetupGroup", new
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
    public static string GetGroupName(Guid tenantId) => $"setup-{tenantId}";
}

#region DTOs

/// <summary>
/// Setup progress update message
/// </summary>
public class SetupProgressMessage
{
    public Guid TenantId { get; set; }
    public SetupStep Step { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public bool IsCompleted { get; set; }
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Setup steps enumeration
/// </summary>
public enum SetupStep
{
    Initializing = 0,
    CreatingDatabase = 1,
    RunningMigrations = 2,
    SeedingData = 3,
    ConfiguringModules = 4,
    CreatingStorage = 5,
    ActivatingTenant = 6,
    Completed = 7,
    Failed = -1
}

#endregion
