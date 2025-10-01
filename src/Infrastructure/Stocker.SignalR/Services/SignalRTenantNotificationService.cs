using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Interfaces.Notifications;
using Stocker.SignalR.Hubs;

namespace Stocker.SignalR.Services;

public sealed class SignalRTenantNotificationService : ITenantNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<SignalRTenantNotificationService> _logger;

    public SignalRTenantNotificationService(
        IHubContext<NotificationHub> hubContext,
        ILogger<SignalRTenantNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyTenantReadyAsync(
        Guid tenantId,
        string companyCode,
        string companyName,
        string contactEmail,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var groupName = $"registration-{contactEmail}";
            
            _logger.LogInformation(
                "🔵 Sending SignalR notification to group: {GroupName} for tenant: {TenantId}",
                groupName, tenantId);

            await _hubContext.Clients.Group(groupName)
                .SendAsync("TenantReady", new
                {
                    tenantId,
                    companyCode,
                    companyName,
                    message = "Hesabınız hazır! Giriş yapabilirsiniz.",
                    timestamp = DateTime.UtcNow
                }, cancellationToken);

            _logger.LogInformation(
                "✅ SignalR notification sent successfully for tenant: {TenantId}, Email: {Email}",
                tenantId, contactEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "❌ Failed to send SignalR notification for tenant: {TenantId}, Email: {Email}",
                tenantId, contactEmail);
            
            // Don't throw - notification failure shouldn't break tenant provisioning
        }
    }
}
