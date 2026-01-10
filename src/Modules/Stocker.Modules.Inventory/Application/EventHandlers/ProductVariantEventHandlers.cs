using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ProductVariant Event Handlers

public class ProductVariantCreatedEventHandler : INotificationHandler<ProductVariantCreatedDomainEvent>
{
    private readonly ILogger<ProductVariantCreatedEventHandler> _logger;

    public ProductVariantCreatedEventHandler(ILogger<ProductVariantCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductVariantCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product variant created: {VariantCode} - {VariantName} for Product {ProductId}",
            notification.VariantCode,
            notification.VariantName,
            notification.ProductId);

        return Task.CompletedTask;
    }
}

public class ProductVariantActivatedEventHandler : INotificationHandler<ProductVariantActivatedDomainEvent>
{
    private readonly ILogger<ProductVariantActivatedEventHandler> _logger;

    public ProductVariantActivatedEventHandler(ILogger<ProductVariantActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductVariantActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product variant activated: {VariantCode} - {VariantName}",
            notification.VariantCode,
            notification.VariantName);

        return Task.CompletedTask;
    }
}

public class ProductVariantDeactivatedEventHandler : INotificationHandler<ProductVariantDeactivatedDomainEvent>
{
    private readonly ILogger<ProductVariantDeactivatedEventHandler> _logger;

    public ProductVariantDeactivatedEventHandler(ILogger<ProductVariantDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductVariantDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Product variant deactivated: {VariantCode} - {VariantName}",
            notification.VariantCode,
            notification.VariantName);

        return Task.CompletedTask;
    }
}

public class ProductVariantStockChangedEventHandler : INotificationHandler<ProductVariantStockChangedDomainEvent>
{
    private readonly ILogger<ProductVariantStockChangedEventHandler> _logger;

    public ProductVariantStockChangedEventHandler(ILogger<ProductVariantStockChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductVariantStockChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product variant stock changed: {VariantCode}, {OldStock} → {NewStock}",
            notification.VariantCode,
            notification.OldStock,
            notification.NewStock);

        return Task.CompletedTask;
    }
}

public class ProductVariantPriceChangedEventHandler : INotificationHandler<ProductVariantPriceChangedDomainEvent>
{
    private readonly ILogger<ProductVariantPriceChangedEventHandler> _logger;

    public ProductVariantPriceChangedEventHandler(ILogger<ProductVariantPriceChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductVariantPriceChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product variant price changed: {VariantCode}, {OldPrice} → {NewPrice}",
            notification.VariantCode,
            notification.OldPrice,
            notification.NewPrice);

        return Task.CompletedTask;
    }
}

#endregion
