using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ProductBundle Event Handlers

public class ProductBundleCreatedEventHandler : INotificationHandler<ProductBundleCreatedDomainEvent>
{
    private readonly ILogger<ProductBundleCreatedEventHandler> _logger;

    public ProductBundleCreatedEventHandler(ILogger<ProductBundleCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductBundleCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product bundle created: {BundleName}, Price: {BundlePrice}, Components: {ComponentCount}",
            notification.BundleName,
            notification.BundlePrice,
            notification.ComponentCount);

        return Task.CompletedTask;
    }
}

public class BundleComponentAddedEventHandler : INotificationHandler<BundleComponentAddedDomainEvent>
{
    private readonly ILogger<BundleComponentAddedEventHandler> _logger;

    public BundleComponentAddedEventHandler(ILogger<BundleComponentAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BundleComponentAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Bundle component added: {ComponentName} to Bundle {BundleId}, Quantity: {Quantity}",
            notification.ComponentName,
            notification.ProductBundleId,
            notification.Quantity);

        return Task.CompletedTask;
    }
}

public class BundleComponentRemovedEventHandler : INotificationHandler<BundleComponentRemovedDomainEvent>
{
    private readonly ILogger<BundleComponentRemovedEventHandler> _logger;

    public BundleComponentRemovedEventHandler(ILogger<BundleComponentRemovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BundleComponentRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Bundle component removed: {ComponentName} from Bundle {BundleId}",
            notification.ComponentName,
            notification.ProductBundleId);

        return Task.CompletedTask;
    }
}

public class ProductBundleActivatedEventHandler : INotificationHandler<ProductBundleActivatedDomainEvent>
{
    private readonly ILogger<ProductBundleActivatedEventHandler> _logger;

    public ProductBundleActivatedEventHandler(ILogger<ProductBundleActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductBundleActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product bundle activated: {BundleName}",
            notification.BundleName);

        return Task.CompletedTask;
    }
}

public class ProductBundleDeactivatedEventHandler : INotificationHandler<ProductBundleDeactivatedDomainEvent>
{
    private readonly ILogger<ProductBundleDeactivatedEventHandler> _logger;

    public ProductBundleDeactivatedEventHandler(ILogger<ProductBundleDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductBundleDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Product bundle deactivated: {BundleName}",
            notification.BundleName);

        return Task.CompletedTask;
    }
}

#endregion
