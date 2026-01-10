using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Ürün oluşturulduğunda çalışan event handler.
/// </summary>
public class ProductCreatedEventHandler : INotificationHandler<ProductCreatedDomainEvent>
{
    private readonly ILogger<ProductCreatedEventHandler> _logger;

    public ProductCreatedEventHandler(ILogger<ProductCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product created: {ProductCode} ({ProductName}), Type: {ProductType}, " +
            "Category: {CategoryId}, UnitPrice: {UnitPrice}",
            notification.Code,
            notification.Name,
            notification.ProductType,
            notification.CategoryId,
            notification.UnitPrice);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Ürün güncellendiğinde çalışan event handler.
/// </summary>
public class ProductUpdatedEventHandler : INotificationHandler<ProductUpdatedDomainEvent>
{
    private readonly ILogger<ProductUpdatedEventHandler> _logger;

    public ProductUpdatedEventHandler(ILogger<ProductUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product updated: {ProductCode} ({ProductName}), CostPrice: {CostPrice}, UnitPrice: {UnitPrice}",
            notification.Code,
            notification.Name,
            notification.CostPrice,
            notification.UnitPrice);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Ürün aktifleştirildiğinde çalışan event handler.
/// </summary>
public class ProductActivatedEventHandler : INotificationHandler<ProductActivatedDomainEvent>
{
    private readonly ILogger<ProductActivatedEventHandler> _logger;

    public ProductActivatedEventHandler(ILogger<ProductActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product activated: {ProductCode} ({ProductName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Ürün pasifleştirildiğinde çalışan event handler.
/// </summary>
public class ProductDeactivatedEventHandler : INotificationHandler<ProductDeactivatedDomainEvent>
{
    private readonly ILogger<ProductDeactivatedEventHandler> _logger;

    public ProductDeactivatedEventHandler(ILogger<ProductDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Product deactivated: {ProductCode} ({ProductName}), By: {DeactivatedBy}, Reason: {Reason}",
            notification.Code,
            notification.Name,
            notification.DeactivatedBy,
            notification.Reason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Ürün stok seviyeleri değiştirildiğinde çalışan event handler.
/// </summary>
public class ProductStockLevelsChangedEventHandler : INotificationHandler<ProductStockLevelsChangedDomainEvent>
{
    private readonly ILogger<ProductStockLevelsChangedEventHandler> _logger;

    public ProductStockLevelsChangedEventHandler(ILogger<ProductStockLevelsChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductStockLevelsChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product stock levels changed: {ProductCode}, Min: {MinimumStock}, Max: {MaximumStock}, " +
            "ReorderPoint: {ReorderPoint}, ReorderQty: {ReorderQuantity}",
            notification.Code,
            notification.MinimumStock,
            notification.MaximumStock,
            notification.ReorderPoint,
            notification.ReorderQuantity);

        return Task.CompletedTask;
    }
}
