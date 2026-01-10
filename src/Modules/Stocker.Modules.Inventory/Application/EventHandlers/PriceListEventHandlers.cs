using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.IntegrationEvents;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Fiyat listesi oluşturulduğunda çalışan event handler.
/// </summary>
public class PriceListCreatedEventHandler : INotificationHandler<PriceListCreatedDomainEvent>
{
    private readonly ILogger<PriceListCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public PriceListCreatedEventHandler(
        ILogger<PriceListCreatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(PriceListCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list created: {PriceListCode} ({PriceListName}), Currency: {Currency}",
            notification.Code,
            notification.Name,
            notification.Currency);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.Code,
            "Created",
            details: $"Name: {notification.Name}, Currency: {notification.Currency}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateAllPriceListsCacheAsync(
            notification.TenantId,
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesi güncellendiğinde çalışan event handler.
/// </summary>
public class PriceListUpdatedEventHandler : INotificationHandler<PriceListUpdatedDomainEvent>
{
    private readonly ILogger<PriceListUpdatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public PriceListUpdatedEventHandler(
        ILogger<PriceListUpdatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(PriceListUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list updated: {PriceListCode} ({PriceListName}), Currency: {Currency}",
            notification.Code,
            notification.Name,
            notification.Currency);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.Code,
            "Updated",
            details: $"Name: {notification.Name}, Currency: {notification.Currency}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidatePriceListCacheAsync(
            notification.TenantId,
            notification.PriceListId,
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesi varsayılan olarak ayarlandığında çalışan event handler.
/// </summary>
public class PriceListSetAsDefaultEventHandler : INotificationHandler<PriceListSetAsDefaultDomainEvent>
{
    private readonly ILogger<PriceListSetAsDefaultEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public PriceListSetAsDefaultEventHandler(
        ILogger<PriceListSetAsDefaultEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(PriceListSetAsDefaultDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list set as default: {PriceListCode} ({PriceListName})",
            notification.Code,
            notification.Name);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.Code,
            "SetAsDefault",
            cancellationToken: cancellationToken);

        // Cache invalidation - invalidate all price lists as default status changed
        await _cacheService.InvalidateAllPriceListsCacheAsync(
            notification.TenantId,
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesi aktifleştirildiğinde çalışan event handler.
/// </summary>
public class PriceListActivatedEventHandler : INotificationHandler<PriceListActivatedDomainEvent>
{
    private readonly ILogger<PriceListActivatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public PriceListActivatedEventHandler(
        ILogger<PriceListActivatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(PriceListActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list activated: {PriceListCode} ({PriceListName})",
            notification.Code,
            notification.Name);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.Code,
            "Activated",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidatePriceListCacheAsync(
            notification.TenantId,
            notification.PriceListId,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new PriceListActivatedIntegrationEvent(
                notification.TenantId,
                notification.PriceListId,
                notification.Code,
                notification.Name,
                string.Empty, // Currency to be resolved
                false, // IsDefault to be resolved
                null, // ValidFrom to be resolved
                null, // ValidTo to be resolved
                null), // CustomerGroupId to be resolved
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesi pasifleştirildiğinde çalışan event handler.
/// </summary>
public class PriceListDeactivatedEventHandler : INotificationHandler<PriceListDeactivatedDomainEvent>
{
    private readonly ILogger<PriceListDeactivatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public PriceListDeactivatedEventHandler(
        ILogger<PriceListDeactivatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(PriceListDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Price list deactivated: {PriceListCode} ({PriceListName}). Prices from this list will no longer be applied.",
            notification.Code,
            notification.Name);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.Code,
            "Deactivated",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidatePriceListCacheAsync(
            notification.TenantId,
            notification.PriceListId,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new PriceListDeactivatedIntegrationEvent(
                notification.TenantId,
                notification.PriceListId,
                notification.Code),
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesine ürün eklendiğinde çalışan event handler.
/// </summary>
public class PriceListItemAddedEventHandler : INotificationHandler<PriceListItemAddedDomainEvent>
{
    private readonly ILogger<PriceListItemAddedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public PriceListItemAddedEventHandler(
        ILogger<PriceListItemAddedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(PriceListItemAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list item added: List {PriceListCode}, Product: {ProductId}, Price: {Price} {Currency}",
            notification.PriceListCode,
            notification.ProductId,
            notification.Price,
            notification.Currency);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.PriceListCode,
            "ItemAdded",
            details: $"Product: {notification.ProductId}, Price: {notification.Price} {notification.Currency}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidatePriceListCacheAsync(
            notification.TenantId,
            notification.PriceListId,
            cancellationToken);

        await _cacheService.InvalidateProductPriceCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesindeki ürün fiyatı güncellendiğinde çalışan event handler.
/// </summary>
public class PriceListItemUpdatedEventHandler : INotificationHandler<PriceListItemUpdatedDomainEvent>
{
    private readonly ILogger<PriceListItemUpdatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public PriceListItemUpdatedEventHandler(
        ILogger<PriceListItemUpdatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(PriceListItemUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list item updated: List {PriceListCode}, Product: {ProductId}, Old Price: {OldPrice}, New Price: {NewPrice} {Currency}",
            notification.PriceListCode,
            notification.ProductId,
            notification.OldPrice,
            notification.NewPrice,
            notification.Currency);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.PriceListCode,
            "ItemUpdated",
            details: $"Product: {notification.ProductId}, Old: {notification.OldPrice}, New: {notification.NewPrice} {notification.Currency}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidatePriceListCacheAsync(
            notification.TenantId,
            notification.PriceListId,
            cancellationToken);

        await _cacheService.InvalidateProductPriceCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new PriceListItemsUpdatedIntegrationEvent(
                notification.TenantId,
                notification.PriceListId,
                notification.PriceListCode,
                new List<PriceListItemChange>
                {
                    new PriceListItemChange(
                        notification.ProductId,
                        "Updated",
                        notification.OldPrice,
                        notification.NewPrice,
                        notification.Currency)
                }),
            cancellationToken);
    }
}

/// <summary>
/// Fiyat listesinden ürün kaldırıldığında çalışan event handler.
/// </summary>
public class PriceListItemRemovedEventHandler : INotificationHandler<PriceListItemRemovedDomainEvent>
{
    private readonly ILogger<PriceListItemRemovedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public PriceListItemRemovedEventHandler(
        ILogger<PriceListItemRemovedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(PriceListItemRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Price list item removed: List {PriceListCode}, Product: {ProductId}",
            notification.PriceListCode,
            notification.ProductId);

        // Audit log
        await _auditService.LogPriceListEventAsync(
            notification.TenantId,
            notification.PriceListId,
            notification.PriceListCode,
            "ItemRemoved",
            details: $"Product: {notification.ProductId}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidatePriceListCacheAsync(
            notification.TenantId,
            notification.PriceListId,
            cancellationToken);

        await _cacheService.InvalidateProductPriceCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}
