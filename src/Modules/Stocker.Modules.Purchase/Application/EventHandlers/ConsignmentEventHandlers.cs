using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region Consignment Event Handlers

/// <summary>
/// Konsinye stok oluşturulduğunda tetiklenen handler
/// </summary>
public class ConsignmentCreatedEventHandler : INotificationHandler<ConsignmentCreatedDomainEvent>
{
    private readonly ILogger<ConsignmentCreatedEventHandler> _logger;

    public ConsignmentCreatedEventHandler(ILogger<ConsignmentCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Konsinye stok oluşturuldu: {ConsignmentNumber}, Tedarikçi: {SupplierName}, Geçerlilik: {ValidFrom} - {ValidTo}, Tenant: {TenantId}",
            notification.ConsignmentNumber,
            notification.SupplierName,
            notification.ValidFrom,
            notification.ValidTo,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Konsinye stok tüketildiğinde tetiklenen handler
/// </summary>
public class ConsignmentConsumedEventHandler : INotificationHandler<ConsignmentConsumedDomainEvent>
{
    private readonly ILogger<ConsignmentConsumedEventHandler> _logger;

    public ConsignmentConsumedEventHandler(ILogger<ConsignmentConsumedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentConsumedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Konsinye stok tüketildi: {ConsignmentNumber}, Tüketilen: {ConsumedQuantity}, Kalan: {RemainingQuantity}, Tenant: {TenantId}",
            notification.ConsignmentNumber,
            notification.ConsumedQuantity,
            notification.RemainingQuantity,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Konsinye stok iade edildiğinde tetiklenen handler
/// </summary>
public class ConsignmentReturnedEventHandler : INotificationHandler<ConsignmentReturnedDomainEvent>
{
    private readonly ILogger<ConsignmentReturnedEventHandler> _logger;

    public ConsignmentReturnedEventHandler(ILogger<ConsignmentReturnedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentReturnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Konsinye stok iade edildi: {ConsignmentNumber}, İade: {ReturnedQuantity}, Sebep: {ReturnReason}, Tenant: {TenantId}",
            notification.ConsignmentNumber,
            notification.ReturnedQuantity,
            notification.ReturnReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Konsinye süresi dolduğunda tetiklenen handler
/// </summary>
public class ConsignmentExpiredEventHandler : INotificationHandler<ConsignmentExpiredDomainEvent>
{
    private readonly ILogger<ConsignmentExpiredEventHandler> _logger;

    public ConsignmentExpiredEventHandler(ILogger<ConsignmentExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ConsignmentExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Konsinye süresi doldu: {ConsignmentNumber}, Kalan Stok: {RemainingQuantity}, Tenant: {TenantId}",
            notification.ConsignmentNumber,
            notification.RemainingQuantity,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
