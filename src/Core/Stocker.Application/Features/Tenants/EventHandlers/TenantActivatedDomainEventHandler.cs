using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Interfaces.Notifications;
using Stocker.Domain.Master.Events;

namespace Stocker.Application.Features.Tenants.EventHandlers;

public sealed class TenantActivatedDomainEventHandler : INotificationHandler<TenantActivatedDomainEvent>
{
    private readonly ITenantNotificationService? _notificationService;
    private readonly ILogger<TenantActivatedDomainEventHandler> _logger;

    public TenantActivatedDomainEventHandler(
        ITenantNotificationService? notificationService,
        ILogger<TenantActivatedDomainEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TenantActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Handling TenantActivatedDomainEvent for tenant: {TenantId}, Company: {CompanyCode}",
            notification.TenantId, notification.CompanyCode);

        if (_notificationService != null)
        {
            await _notificationService.NotifyTenantReadyAsync(
                notification.TenantId,
                notification.CompanyCode,
                notification.CompanyName,
                notification.ContactEmail,
                cancellationToken);
        }
        else
        {
            _logger.LogWarning(
                "⚠️ ITenantNotificationService not registered - skipping real-time notification for tenant: {TenantId}",
                notification.TenantId);
        }
    }
}
