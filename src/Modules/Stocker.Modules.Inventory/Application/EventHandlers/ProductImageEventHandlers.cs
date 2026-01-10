using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ProductImage Event Handlers

public class ProductImageAddedEventHandler : INotificationHandler<ProductImageAddedDomainEvent>
{
    private readonly ILogger<ProductImageAddedEventHandler> _logger;

    public ProductImageAddedEventHandler(ILogger<ProductImageAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductImageAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product image added: Product {ProductId}, Primary: {IsPrimary}, Order: {DisplayOrder}",
            notification.ProductId,
            notification.IsPrimary,
            notification.DisplayOrder);

        return Task.CompletedTask;
    }
}

public class ProductImageSetAsPrimaryEventHandler : INotificationHandler<ProductImageSetAsPrimaryDomainEvent>
{
    private readonly ILogger<ProductImageSetAsPrimaryEventHandler> _logger;

    public ProductImageSetAsPrimaryEventHandler(ILogger<ProductImageSetAsPrimaryEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductImageSetAsPrimaryDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product image set as primary: Product {ProductId}",
            notification.ProductId);

        return Task.CompletedTask;
    }
}

public class ProductImageDeletedEventHandler : INotificationHandler<ProductImageDeletedDomainEvent>
{
    private readonly ILogger<ProductImageDeletedEventHandler> _logger;

    public ProductImageDeletedEventHandler(ILogger<ProductImageDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductImageDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Product image deleted: Product {ProductId}",
            notification.ProductId);

        return Task.CompletedTask;
    }
}

public class ProductImagesReorderedEventHandler : INotificationHandler<ProductImagesReorderedDomainEvent>
{
    private readonly ILogger<ProductImagesReorderedEventHandler> _logger;

    public ProductImagesReorderedEventHandler(ILogger<ProductImagesReorderedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductImagesReorderedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product images reordered: Product {ProductId}, Count: {ImageCount}",
            notification.ProductId,
            notification.ImageCount);

        return Task.CompletedTask;
    }
}

#endregion
