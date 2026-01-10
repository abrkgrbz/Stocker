using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region BarcodeDefinition Event Handlers

public class BarcodeDefinitionCreatedEventHandler : INotificationHandler<BarcodeDefinitionCreatedDomainEvent>
{
    private readonly ILogger<BarcodeDefinitionCreatedEventHandler> _logger;

    public BarcodeDefinitionCreatedEventHandler(ILogger<BarcodeDefinitionCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BarcodeDefinitionCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Barcode definition created: {Barcode} for Product {ProductId}, Type: {BarcodeType}, Primary: {IsPrimary}",
            notification.Barcode,
            notification.ProductId,
            notification.BarcodeType,
            notification.IsPrimary);

        return Task.CompletedTask;
    }
}

public class BarcodeDefinitionSetAsPrimaryEventHandler : INotificationHandler<BarcodeDefinitionSetAsPrimaryDomainEvent>
{
    private readonly ILogger<BarcodeDefinitionSetAsPrimaryEventHandler> _logger;

    public BarcodeDefinitionSetAsPrimaryEventHandler(ILogger<BarcodeDefinitionSetAsPrimaryEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BarcodeDefinitionSetAsPrimaryDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Barcode set as primary: {Barcode} for Product {ProductId}",
            notification.Barcode,
            notification.ProductId);

        return Task.CompletedTask;
    }
}

public class BarcodeDefinitionDeletedEventHandler : INotificationHandler<BarcodeDefinitionDeletedDomainEvent>
{
    private readonly ILogger<BarcodeDefinitionDeletedEventHandler> _logger;

    public BarcodeDefinitionDeletedEventHandler(ILogger<BarcodeDefinitionDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BarcodeDefinitionDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Barcode definition deleted: {Barcode} for Product {ProductId}",
            notification.Barcode,
            notification.ProductId);

        return Task.CompletedTask;
    }
}

#endregion
