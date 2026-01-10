using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region SupplierProduct Event Handlers

public class SupplierProductCreatedEventHandler : INotificationHandler<SupplierProductCreatedDomainEvent>
{
    private readonly ILogger<SupplierProductCreatedEventHandler> _logger;

    public SupplierProductCreatedEventHandler(ILogger<SupplierProductCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierProductCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier product created: Supplier {SupplierId} - Product {ProductId}, Price: {PurchasePrice}, Lead Time: {LeadTimeDays} days",
            notification.SupplierId,
            notification.ProductId,
            notification.PurchasePrice,
            notification.LeadTimeDays);

        return Task.CompletedTask;
    }
}

public class SupplierProductPriceUpdatedEventHandler : INotificationHandler<SupplierProductPriceUpdatedDomainEvent>
{
    private readonly ILogger<SupplierProductPriceUpdatedEventHandler> _logger;

    public SupplierProductPriceUpdatedEventHandler(ILogger<SupplierProductPriceUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierProductPriceUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier product price updated: Supplier {SupplierId} - Product {ProductId}, {OldPrice} → {NewPrice}",
            notification.SupplierId,
            notification.ProductId,
            notification.OldPrice,
            notification.NewPrice);

        return Task.CompletedTask;
    }
}

public class SupplierProductSetAsPrimaryEventHandler : INotificationHandler<SupplierProductSetAsPrimaryDomainEvent>
{
    private readonly ILogger<SupplierProductSetAsPrimaryEventHandler> _logger;

    public SupplierProductSetAsPrimaryEventHandler(ILogger<SupplierProductSetAsPrimaryEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierProductSetAsPrimaryDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier set as primary: Supplier {SupplierId} for Product {ProductId}",
            notification.SupplierId,
            notification.ProductId);

        return Task.CompletedTask;
    }
}

public class SupplierProductDeactivatedEventHandler : INotificationHandler<SupplierProductDeactivatedDomainEvent>
{
    private readonly ILogger<SupplierProductDeactivatedEventHandler> _logger;

    public SupplierProductDeactivatedEventHandler(ILogger<SupplierProductDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierProductDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Supplier product deactivated: Supplier {SupplierId} - Product {ProductId}",
            notification.SupplierId,
            notification.ProductId);

        return Task.CompletedTask;
    }
}

#endregion
