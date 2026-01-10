using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.SignalR.Hubs;
using Stocker.SignalR.Constants;

namespace Stocker.SignalR.Services;

/// <summary>
/// Service for broadcasting domain events to monitoring clients via SignalR
/// </summary>
public interface IDomainEventMonitorService
{
    Task BroadcastDomainEventAsync(DomainEventInfo eventInfo, CancellationToken cancellationToken = default);
}

/// <summary>
/// Domain event information for monitoring
/// </summary>
public record DomainEventInfo(
    string EventType,
    string Module,
    string EntityType,
    string EntityId,
    Guid TenantId,
    string Summary,
    Dictionary<string, object>? Metadata = null,
    DateTime? OccurredAt = null);

public class DomainEventMonitorService : IDomainEventMonitorService
{
    private readonly IHubContext<MonitoringHub> _hubContext;
    private readonly ILogger<DomainEventMonitorService> _logger;

    public DomainEventMonitorService(
        IHubContext<MonitoringHub> hubContext,
        ILogger<DomainEventMonitorService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastDomainEventAsync(DomainEventInfo eventInfo, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new
            {
                eventType = eventInfo.EventType,
                module = eventInfo.Module,
                entityType = eventInfo.EntityType,
                entityId = eventInfo.EntityId,
                tenantId = eventInfo.TenantId,
                summary = eventInfo.Summary,
                metadata = eventInfo.Metadata ?? new Dictionary<string, object>(),
                occurredAt = eventInfo.OccurredAt ?? DateTime.UtcNow,
                timestamp = DateTime.UtcNow
            };

            // Broadcast to admin monitoring group
            await _hubContext.Clients
                .Group(SignalRGroups.AdminMonitoring)
                .SendAsync(SignalREvents.DomainEventOccurred, payload, cancellationToken);

            // Also broadcast to tenant-specific monitoring group
            await _hubContext.Clients
                .Group(SignalRGroups.ForMonitoringTenant(eventInfo.TenantId.ToString()))
                .SendAsync(SignalREvents.DomainEventOccurred, payload, cancellationToken);

            _logger.LogDebug(
                "Domain event broadcasted: {EventType} for {EntityType}:{EntityId} in Tenant {TenantId}",
                eventInfo.EventType,
                eventInfo.EntityType,
                eventInfo.EntityId,
                eventInfo.TenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to broadcast domain event: {EventType} for {EntityType}:{EntityId}",
                eventInfo.EventType,
                eventInfo.EntityType,
                eventInfo.EntityId);
        }
    }
}
