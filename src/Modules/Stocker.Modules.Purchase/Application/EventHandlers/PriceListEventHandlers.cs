using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PriceList Event Handlers

/// <summary>
/// Fiyat listesi oluşturulduğunda tetiklenen handler
/// </summary>
public class PriceListCreatedEventHandler : INotificationHandler<PriceListCreatedDomainEvent>
{
    private readonly ILogger<PriceListCreatedEventHandler> _logger;

    public PriceListCreatedEventHandler(ILogger<PriceListCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PriceListCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fiyat listesi oluşturuldu: {PriceListName}, Tedarikçi: {SupplierName}, Geçerlilik: {ValidFrom} - {ValidTo}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.SupplierName,
            notification.ValidFrom,
            notification.ValidTo,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fiyat listesi güncellendiğinde tetiklenen handler
/// </summary>
public class PriceListUpdatedEventHandler : INotificationHandler<PriceListUpdatedDomainEvent>
{
    private readonly ILogger<PriceListUpdatedEventHandler> _logger;

    public PriceListUpdatedEventHandler(ILogger<PriceListUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PriceListUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fiyat listesi güncellendi: {PriceListName}, Güncellenen Kalem: {UpdatedItemCount}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.UpdatedItemCount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fiyat listesi aktifleştirildiğinde tetiklenen handler
/// </summary>
public class PriceListActivatedEventHandler : INotificationHandler<PriceListActivatedDomainEvent>
{
    private readonly ILogger<PriceListActivatedEventHandler> _logger;

    public PriceListActivatedEventHandler(ILogger<PriceListActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PriceListActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fiyat listesi aktifleştirildi: {PriceListName}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fiyat listesi süresi dolduğunda tetiklenen handler
/// </summary>
public class PriceListExpiredEventHandler : INotificationHandler<PriceListExpiredDomainEvent>
{
    private readonly ILogger<PriceListExpiredEventHandler> _logger;

    public PriceListExpiredEventHandler(ILogger<PriceListExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PriceListExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Fiyat listesi süresi doldu: {PriceListName}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
