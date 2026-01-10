using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Position Event Handlers

public class PositionCreatedEventHandler : INotificationHandler<PositionCreatedDomainEvent>
{
    private readonly ILogger<PositionCreatedEventHandler> _logger;

    public PositionCreatedEventHandler(ILogger<PositionCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PositionCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Position created: {Code} - {Title} in {DepartmentName}",
            notification.Code,
            notification.Title,
            notification.DepartmentName);

        return Task.CompletedTask;
    }
}

public class PositionFilledEventHandler : INotificationHandler<PositionFilledDomainEvent>
{
    private readonly ILogger<PositionFilledEventHandler> _logger;

    public PositionFilledEventHandler(ILogger<PositionFilledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PositionFilledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Position filled: {Title} → {EmployeeName}",
            notification.Title,
            notification.EmployeeName);

        return Task.CompletedTask;
    }
}

public class PositionVacatedEventHandler : INotificationHandler<PositionVacatedDomainEvent>
{
    private readonly ILogger<PositionVacatedEventHandler> _logger;

    public PositionVacatedEventHandler(ILogger<PositionVacatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PositionVacatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Position vacated: {Title}, Reason: {VacancyReason}",
            notification.Title,
            notification.VacancyReason);

        return Task.CompletedTask;
    }
}

#endregion
