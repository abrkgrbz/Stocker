using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region CostCenter Event Handlers

/// <summary>
/// Maliyet merkezi oluşturulduğunda tetiklenen handler
/// </summary>
public class CostCenterCreatedEventHandler : INotificationHandler<CostCenterCreatedDomainEvent>
{
    private readonly ILogger<CostCenterCreatedEventHandler> _logger;

    public CostCenterCreatedEventHandler(ILogger<CostCenterCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CostCenterCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Maliyet merkezi oluşturuldu: {CostCenterCode} - {CostCenterName}, Üst: {ParentCostCenterId}, Tenant: {TenantId}",
            notification.CostCenterCode,
            notification.CostCenterName,
            notification.ParentCostCenterId?.ToString() ?? "Yok",
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Maliyet merkezi güncellendiğinde tetiklenen handler
/// </summary>
public class CostCenterUpdatedEventHandler : INotificationHandler<CostCenterUpdatedDomainEvent>
{
    private readonly ILogger<CostCenterUpdatedEventHandler> _logger;

    public CostCenterUpdatedEventHandler(ILogger<CostCenterUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CostCenterUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Maliyet merkezi güncellendi: {CostCenterCode} - {CostCenterName}, Tenant: {TenantId}",
            notification.CostCenterCode,
            notification.CostCenterName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Maliyet merkezi devre dışı bırakıldığında tetiklenen handler
/// </summary>
public class CostCenterDeactivatedEventHandler : INotificationHandler<CostCenterDeactivatedDomainEvent>
{
    private readonly ILogger<CostCenterDeactivatedEventHandler> _logger;

    public CostCenterDeactivatedEventHandler(ILogger<CostCenterDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CostCenterDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Maliyet merkezi devre dışı bırakıldı: {CostCenterCode} - {CostCenterName}, Tenant: {TenantId}",
            notification.CostCenterCode,
            notification.CostCenterName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
