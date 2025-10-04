using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Master.Events;
using Stocker.SignalR.Hubs;

namespace Stocker.SignalR.EventHandlers;

/// <summary>
/// Handles TenantCreatedDomainEvent and sends real-time notifications via SignalR
/// </summary>
public sealed class TenantCreatedEventHandler : INotificationHandler<TenantCreatedDomainEvent>
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<TenantCreatedEventHandler> _logger;

    public TenantCreatedEventHandler(
        IHubContext<NotificationHub> hubContext,
        ILogger<TenantCreatedEventHandler> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task Handle(TenantCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation(
                "🔵 TenantCreatedEvent received - TenantId: {TenantId}, Name: {Name}, Code: {Code}",
                notification.TenantId, notification.Name, notification.Identifier);

            // Send notification to admin group
            await _hubContext.Clients.Group("admin-notifications")
                .SendAsync("TenantCreated", new
                {
                    tenantId = notification.TenantId,
                    tenantCode = notification.Identifier,
                    tenantName = notification.Name,
                    message = $"Yeni tenant oluşturuldu: {notification.Name}",
                    type = "Success",
                    priority = "Normal",
                    timestamp = DateTime.UtcNow
                }, cancellationToken);

            // Send notification to registration group (for the user who registered)
            var registrationGroup = $"registration-{notification.Identifier}";
            await _hubContext.Clients.Group(registrationGroup)
                .SendAsync("TenantReady", new
                {
                    tenantId = notification.TenantId,
                    companyCode = notification.Identifier,
                    companyName = notification.Name,
                    message = "Hesabınız başarıyla oluşturuldu!",
                    timestamp = DateTime.UtcNow
                }, cancellationToken);

            _logger.LogInformation(
                "✅ SignalR notifications sent for tenant: {TenantId}",
                notification.TenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "❌ Failed to send SignalR notification for TenantCreated event - TenantId: {TenantId}",
                notification.TenantId);
            
            // Don't throw - notification failure shouldn't break tenant creation
        }
    }
}
