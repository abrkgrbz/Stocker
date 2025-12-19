using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Interfaces.Notifications;
using Stocker.SignalR.Constants;
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
            var groupName = SignalRGroups.ForRegistrationEmail(contactEmail);

            _logger.LogInformation(
                "Sending SignalR notification to group: GroupName={GroupName}, TenantId={TenantId}",
                groupName, tenantId);

            await _hubContext.Clients.Group(groupName)
                .SendAsync(SignalREvents.TenantReady, new
                {
                    tenantId,
                    companyCode,
                    companyName,
                    message = "Hesabınız hazır! Giriş yapabilirsiniz.",
                    timestamp = DateTime.UtcNow
                }, cancellationToken);

            _logger.LogInformation(
                "SignalR notification sent successfully: TenantId={TenantId}, Email={Email}",
                tenantId, contactEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send SignalR notification: TenantId={TenantId}, Email={Email}",
                tenantId, contactEmail);
            
            // Don't throw - notification failure shouldn't break tenant provisioning
        }
    }
}
