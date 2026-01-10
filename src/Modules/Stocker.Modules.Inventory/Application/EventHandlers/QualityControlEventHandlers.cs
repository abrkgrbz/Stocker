using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

#region QualityControl Event Handlers

public class QualityControlCreatedEventHandler : INotificationHandler<QualityControlCreatedDomainEvent>
{
    private readonly ILogger<QualityControlCreatedEventHandler> _logger;

    public QualityControlCreatedEventHandler(ILogger<QualityControlCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QualityControlCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quality control created: Product {ProductId}, Type: {InspectionType}, Inspector: {InspectorId}",
            notification.ProductId,
            notification.InspectionType,
            notification.InspectorId);

        return Task.CompletedTask;
    }
}

public class QualityControlCompletedEventHandler : INotificationHandler<QualityControlCompletedDomainEvent>
{
    private readonly ILogger<QualityControlCompletedEventHandler> _logger;

    public QualityControlCompletedEventHandler(ILogger<QualityControlCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QualityControlCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quality control completed: Product {ProductId}, Result: {Result}, Passed: {IsPassed}",
            notification.ProductId,
            notification.Result,
            notification.IsPassed);

        return Task.CompletedTask;
    }
}

public class QualityControlFailedEventHandler : INotificationHandler<QualityControlFailedDomainEvent>
{
    private readonly ILogger<QualityControlFailedEventHandler> _logger;

    public QualityControlFailedEventHandler(ILogger<QualityControlFailedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QualityControlFailedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Quality control failed: Product {ProductId}, Reason: {FailureReason}, Failed Qty: {FailedQuantity}",
            notification.ProductId,
            notification.FailureReason,
            notification.FailedQuantity);

        return Task.CompletedTask;
    }
}

public class QualityControlApprovedEventHandler : INotificationHandler<QualityControlApprovedDomainEvent>
{
    private readonly ILogger<QualityControlApprovedEventHandler> _logger;

    public QualityControlApprovedEventHandler(ILogger<QualityControlApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QualityControlApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quality control approved: Product {ProductId}, Approved Qty: {ApprovedQuantity}",
            notification.ProductId,
            notification.ApprovedQuantity);

        return Task.CompletedTask;
    }
}

public class QualityControlRejectedEventHandler : INotificationHandler<QualityControlRejectedDomainEvent>
{
    private readonly ILogger<QualityControlRejectedEventHandler> _logger;

    public QualityControlRejectedEventHandler(ILogger<QualityControlRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QualityControlRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Quality control rejected: Product {ProductId}, Reason: {RejectionReason}",
            notification.ProductId,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

#endregion
