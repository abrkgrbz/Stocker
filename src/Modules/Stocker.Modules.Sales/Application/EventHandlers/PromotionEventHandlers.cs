using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Promotion Event Handlers

/// <summary>
/// Promosyon oluşturulduğunda tetiklenen handler
/// </summary>
public class PromotionCreatedEventHandler : INotificationHandler<PromotionCreatedDomainEvent>
{
    private readonly ILogger<PromotionCreatedEventHandler> _logger;

    public PromotionCreatedEventHandler(ILogger<PromotionCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromotionCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Promosyon oluşturuldu: {PromotionCode} - {PromotionName}, İndirim: {DiscountValue} ({DiscountType}), Tenant: {TenantId}",
            notification.PromotionCode,
            notification.PromotionName,
            notification.DiscountValue,
            notification.DiscountType,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Promosyon aktifleştirildiğinde tetiklenen handler
/// </summary>
public class PromotionActivatedEventHandler : INotificationHandler<PromotionActivatedDomainEvent>
{
    private readonly ILogger<PromotionActivatedEventHandler> _logger;

    public PromotionActivatedEventHandler(ILogger<PromotionActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromotionActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Promosyon aktifleştirildi: {PromotionCode} - {PromotionName}, Tenant: {TenantId}",
            notification.PromotionCode,
            notification.PromotionName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Promosyon uygulandığında tetiklenen handler
/// </summary>
public class PromotionAppliedEventHandler : INotificationHandler<PromotionAppliedDomainEvent>
{
    private readonly ILogger<PromotionAppliedEventHandler> _logger;

    public PromotionAppliedEventHandler(ILogger<PromotionAppliedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromotionAppliedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Promosyon uygulandı: {PromotionCode}, Sipariş: {OrderNumber}, İndirim: {DiscountAmount}, Tenant: {TenantId}",
            notification.PromotionCode,
            notification.OrderNumber,
            notification.DiscountAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Promosyon kullanım limiti dolduğunda tetiklenen handler
/// </summary>
public class PromotionUsageLimitReachedEventHandler : INotificationHandler<PromotionUsageLimitReachedDomainEvent>
{
    private readonly ILogger<PromotionUsageLimitReachedEventHandler> _logger;

    public PromotionUsageLimitReachedEventHandler(ILogger<PromotionUsageLimitReachedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromotionUsageLimitReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Promosyon kullanım limiti doldu: {PromotionCode}, Kullanım: {UsageCount}/{UsageLimit}, Tenant: {TenantId}",
            notification.PromotionCode,
            notification.UsageCount,
            notification.UsageLimit,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Promosyon süresi dolduğunda tetiklenen handler
/// </summary>
public class PromotionExpiredEventHandler : INotificationHandler<PromotionExpiredDomainEvent>
{
    private readonly ILogger<PromotionExpiredEventHandler> _logger;

    public PromotionExpiredEventHandler(ILogger<PromotionExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromotionExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Promosyon süresi doldu: {PromotionCode}, Tenant: {TenantId}",
            notification.PromotionCode,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
