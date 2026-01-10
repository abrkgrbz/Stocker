using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ReorderRule Event Handlers

public class ReorderRuleCreatedEventHandler : INotificationHandler<ReorderRuleCreatedDomainEvent>
{
    private readonly ILogger<ReorderRuleCreatedEventHandler> _logger;

    public ReorderRuleCreatedEventHandler(ILogger<ReorderRuleCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderRuleCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reorder rule created: Product {ProductId}, Warehouse {WarehouseId}, Min: {MinimumStock}, Reorder Point: {ReorderPoint}",
            notification.ProductId,
            notification.WarehouseId,
            notification.MinimumStock,
            notification.ReorderPoint);

        return Task.CompletedTask;
    }
}

public class ReorderPointReachedEventHandler : INotificationHandler<ReorderPointReachedDomainEvent>
{
    private readonly ILogger<ReorderPointReachedEventHandler> _logger;

    public ReorderPointReachedEventHandler(ILogger<ReorderPointReachedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderPointReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Reorder point reached: Product {ProductId}, Current: {CurrentStock}, Point: {ReorderPoint}, Suggested: {SuggestedQuantity}",
            notification.ProductId,
            notification.CurrentStock,
            notification.ReorderPoint,
            notification.SuggestedQuantity);

        return Task.CompletedTask;
    }
}

public class ReorderRuleActivatedEventHandler : INotificationHandler<ReorderRuleActivatedDomainEvent>
{
    private readonly ILogger<ReorderRuleActivatedEventHandler> _logger;

    public ReorderRuleActivatedEventHandler(ILogger<ReorderRuleActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderRuleActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reorder rule activated: Product {ProductId}, Warehouse {WarehouseId}",
            notification.ProductId,
            notification.WarehouseId);

        return Task.CompletedTask;
    }
}

public class ReorderRuleDeactivatedEventHandler : INotificationHandler<ReorderRuleDeactivatedDomainEvent>
{
    private readonly ILogger<ReorderRuleDeactivatedEventHandler> _logger;

    public ReorderRuleDeactivatedEventHandler(ILogger<ReorderRuleDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderRuleDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Reorder rule deactivated: Product {ProductId}, Warehouse {WarehouseId}",
            notification.ProductId,
            notification.WarehouseId);

        return Task.CompletedTask;
    }
}

#endregion
