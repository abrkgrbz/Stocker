using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region PriceList Event Handlers

/// <summary>
/// Satış fiyat listesi oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesPriceListCreatedEventHandler : INotificationHandler<SalesPriceListCreatedDomainEvent>
{
    private readonly ILogger<SalesPriceListCreatedEventHandler> _logger;

    public SalesPriceListCreatedEventHandler(ILogger<SalesPriceListCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesPriceListCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fiyat listesi oluşturuldu: {PriceListName}, Geçerlilik: {ValidFrom} - {ValidTo}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.ValidFrom,
            notification.ValidTo,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fiyat listesi güncellendiğinde tetiklenen handler
/// </summary>
public class SalesPriceListUpdatedEventHandler : INotificationHandler<SalesPriceListUpdatedDomainEvent>
{
    private readonly ILogger<SalesPriceListUpdatedEventHandler> _logger;

    public SalesPriceListUpdatedEventHandler(ILogger<SalesPriceListUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesPriceListUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fiyat listesi güncellendi: {PriceListName}, Güncellenen: {UpdatedItemCount} kalem, Tenant: {TenantId}",
            notification.PriceListName,
            notification.UpdatedItemCount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fiyat listesi aktifleştirildiğinde tetiklenen handler
/// </summary>
public class SalesPriceListActivatedEventHandler : INotificationHandler<SalesPriceListActivatedDomainEvent>
{
    private readonly ILogger<SalesPriceListActivatedEventHandler> _logger;

    public SalesPriceListActivatedEventHandler(ILogger<SalesPriceListActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesPriceListActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fiyat listesi aktifleştirildi: {PriceListName}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fiyat listesi süresi dolduğunda tetiklenen handler
/// </summary>
public class SalesPriceListExpiredEventHandler : INotificationHandler<SalesPriceListExpiredDomainEvent>
{
    private readonly ILogger<SalesPriceListExpiredEventHandler> _logger;

    public SalesPriceListExpiredEventHandler(ILogger<SalesPriceListExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesPriceListExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış fiyat listesi süresi doldu: {PriceListName}, Tenant: {TenantId}",
            notification.PriceListName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
