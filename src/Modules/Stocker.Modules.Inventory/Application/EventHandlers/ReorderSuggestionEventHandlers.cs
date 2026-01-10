using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region ReorderSuggestion Event Handlers

public class ReorderSuggestionCreatedEventHandler : INotificationHandler<ReorderSuggestionCreatedDomainEvent>
{
    private readonly ILogger<ReorderSuggestionCreatedEventHandler> _logger;

    public ReorderSuggestionCreatedEventHandler(ILogger<ReorderSuggestionCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderSuggestionCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reorder suggestion created: Product {ProductId}, Suggested Qty: {SuggestedQuantity}, Current Stock: {CurrentStock}",
            notification.ProductId,
            notification.SuggestedQuantity,
            notification.CurrentStock);

        return Task.CompletedTask;
    }
}

public class ReorderSuggestionApprovedEventHandler : INotificationHandler<ReorderSuggestionApprovedDomainEvent>
{
    private readonly ILogger<ReorderSuggestionApprovedEventHandler> _logger;

    public ReorderSuggestionApprovedEventHandler(ILogger<ReorderSuggestionApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderSuggestionApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reorder suggestion approved: Product {ProductId}, Approved Qty: {ApprovedQuantity}, PO: {PurchaseOrderId}",
            notification.ProductId,
            notification.ApprovedQuantity,
            notification.PurchaseOrderId?.ToString() ?? "Not created");

        return Task.CompletedTask;
    }
}

public class ReorderSuggestionRejectedEventHandler : INotificationHandler<ReorderSuggestionRejectedDomainEvent>
{
    private readonly ILogger<ReorderSuggestionRejectedEventHandler> _logger;

    public ReorderSuggestionRejectedEventHandler(ILogger<ReorderSuggestionRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderSuggestionRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Reorder suggestion rejected: Product {ProductId}, Reason: {RejectionReason}",
            notification.ProductId,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

public class ReorderSuggestionConvertedToPurchaseOrderEventHandler : INotificationHandler<ReorderSuggestionConvertedToPurchaseOrderDomainEvent>
{
    private readonly ILogger<ReorderSuggestionConvertedToPurchaseOrderEventHandler> _logger;

    public ReorderSuggestionConvertedToPurchaseOrderEventHandler(ILogger<ReorderSuggestionConvertedToPurchaseOrderEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReorderSuggestionConvertedToPurchaseOrderDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reorder suggestion converted to PO: Product {ProductId} → PO {PurchaseOrderId}, Qty: {OrderedQuantity}",
            notification.ProductId,
            notification.PurchaseOrderId,
            notification.OrderedQuantity);

        return Task.CompletedTask;
    }
}

#endregion
