using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PurchaseRequest Event Handlers

/// <summary>
/// Satın alma talebi oluşturulduğunda tetiklenen handler
/// </summary>
public class PurchaseRequestCreatedEventHandler : INotificationHandler<PurchaseRequestCreatedDomainEvent>
{
    private readonly ILogger<PurchaseRequestCreatedEventHandler> _logger;

    public PurchaseRequestCreatedEventHandler(ILogger<PurchaseRequestCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseRequestCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma talebi oluşturuldu: {RequestNumber}, Talep Eden: {RequestedByName}, Öncelik: {Priority}, Tenant: {TenantId}",
            notification.RequestNumber,
            notification.RequestedByName,
            notification.Priority,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma talebi onaylandığında tetiklenen handler
/// </summary>
public class PurchaseRequestApprovedEventHandler : INotificationHandler<PurchaseRequestApprovedDomainEvent>
{
    private readonly ILogger<PurchaseRequestApprovedEventHandler> _logger;

    public PurchaseRequestApprovedEventHandler(ILogger<PurchaseRequestApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseRequestApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma talebi onaylandı: {RequestNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.RequestNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma talebi reddedildiğinde tetiklenen handler
/// </summary>
public class PurchaseRequestRejectedEventHandler : INotificationHandler<PurchaseRequestRejectedDomainEvent>
{
    private readonly ILogger<PurchaseRequestRejectedEventHandler> _logger;

    public PurchaseRequestRejectedEventHandler(ILogger<PurchaseRequestRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseRequestRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma talebi reddedildi: {RequestNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.RequestNumber,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma talebi siparişe dönüştürüldüğünde tetiklenen handler
/// </summary>
public class PurchaseRequestConvertedToOrderEventHandler : INotificationHandler<PurchaseRequestConvertedToOrderDomainEvent>
{
    private readonly ILogger<PurchaseRequestConvertedToOrderEventHandler> _logger;

    public PurchaseRequestConvertedToOrderEventHandler(ILogger<PurchaseRequestConvertedToOrderEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseRequestConvertedToOrderDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma talebi siparişe dönüştürüldü: {RequestNumber} -> {OrderNumber}, Tenant: {TenantId}",
            notification.RequestNumber,
            notification.OrderNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
