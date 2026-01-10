using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region SuccessionPlan Event Handlers

public class SuccessionPlanCreatedEventHandler : INotificationHandler<SuccessionPlanCreatedDomainEvent>
{
    private readonly ILogger<SuccessionPlanCreatedEventHandler> _logger;

    public SuccessionPlanCreatedEventHandler(ILogger<SuccessionPlanCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SuccessionPlanCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Succession plan created for: {PositionTitle}, Incumbent: {CurrentIncumbentName}",
            notification.PositionTitle,
            notification.CurrentIncumbentName);

        return Task.CompletedTask;
    }
}

public class SuccessorIdentifiedEventHandler : INotificationHandler<SuccessorIdentifiedDomainEvent>
{
    private readonly ILogger<SuccessorIdentifiedEventHandler> _logger;

    public SuccessorIdentifiedEventHandler(ILogger<SuccessorIdentifiedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SuccessorIdentifiedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Successor identified: {SuccessorName} for {PositionTitle}, Readiness: {ReadinessLevel}",
            notification.SuccessorName,
            notification.PositionTitle,
            notification.ReadinessLevel);

        return Task.CompletedTask;
    }
}

public class SuccessionPlanActivatedEventHandler : INotificationHandler<SuccessionPlanActivatedDomainEvent>
{
    private readonly ILogger<SuccessionPlanActivatedEventHandler> _logger;

    public SuccessionPlanActivatedEventHandler(ILogger<SuccessionPlanActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SuccessionPlanActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Succession plan activated: {SuccessorName} → {PositionTitle}, Effective: {EffectiveDate}",
            notification.SuccessorName,
            notification.PositionTitle,
            notification.EffectiveDate);

        return Task.CompletedTask;
    }
}

#endregion
