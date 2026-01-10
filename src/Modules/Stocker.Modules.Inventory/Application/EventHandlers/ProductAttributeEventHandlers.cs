using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ProductAttribute Event Handlers

public class ProductAttributeCreatedEventHandler : INotificationHandler<ProductAttributeCreatedDomainEvent>
{
    private readonly ILogger<ProductAttributeCreatedEventHandler> _logger;

    public ProductAttributeCreatedEventHandler(ILogger<ProductAttributeCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductAttributeCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product attribute created: Product {ProductId}, {AttributeName} = {AttributeValue}",
            notification.ProductId,
            notification.AttributeName,
            notification.AttributeValue);

        return Task.CompletedTask;
    }
}

public class ProductAttributeUpdatedEventHandler : INotificationHandler<ProductAttributeUpdatedDomainEvent>
{
    private readonly ILogger<ProductAttributeUpdatedEventHandler> _logger;

    public ProductAttributeUpdatedEventHandler(ILogger<ProductAttributeUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductAttributeUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product attribute updated: Product {ProductId}, {AttributeName}: {OldValue} → {NewValue}",
            notification.ProductId,
            notification.AttributeName,
            notification.OldValue,
            notification.NewValue);

        return Task.CompletedTask;
    }
}

public class ProductAttributeDeletedEventHandler : INotificationHandler<ProductAttributeDeletedDomainEvent>
{
    private readonly ILogger<ProductAttributeDeletedEventHandler> _logger;

    public ProductAttributeDeletedEventHandler(ILogger<ProductAttributeDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductAttributeDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Product attribute deleted: Product {ProductId}, {AttributeName}",
            notification.ProductId,
            notification.AttributeName);

        return Task.CompletedTask;
    }
}

#endregion
