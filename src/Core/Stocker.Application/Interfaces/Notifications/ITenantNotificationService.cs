namespace Stocker.Application.Interfaces.Notifications;

public interface ITenantNotificationService
{
    Task NotifyTenantReadyAsync(
        Guid tenantId,
        string companyCode,
        string companyName,
        string contactEmail,
        CancellationToken cancellationToken = default);
}
