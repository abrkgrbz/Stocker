using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region DisciplinaryAction Event Handlers

public class DisciplinaryActionCreatedEventHandler : INotificationHandler<DisciplinaryActionCreatedDomainEvent>
{
    private readonly ILogger<DisciplinaryActionCreatedEventHandler> _logger;

    public DisciplinaryActionCreatedEventHandler(ILogger<DisciplinaryActionCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DisciplinaryActionCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Disciplinary action created: {EmployeeName}, Type: {ActionType}, Reason: {Reason}",
            notification.EmployeeName,
            notification.ActionType,
            notification.Reason);

        return Task.CompletedTask;
    }
}

public class DisciplinaryActionIssuedEventHandler : INotificationHandler<DisciplinaryActionIssuedDomainEvent>
{
    private readonly ILogger<DisciplinaryActionIssuedEventHandler> _logger;

    public DisciplinaryActionIssuedEventHandler(ILogger<DisciplinaryActionIssuedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DisciplinaryActionIssuedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Disciplinary action issued: {EmployeeName}, Type: {ActionType}",
            notification.EmployeeName,
            notification.ActionType);

        return Task.CompletedTask;
    }
}

public class DisciplinaryActionAppealedEventHandler : INotificationHandler<DisciplinaryActionAppealedDomainEvent>
{
    private readonly ILogger<DisciplinaryActionAppealedEventHandler> _logger;

    public DisciplinaryActionAppealedEventHandler(ILogger<DisciplinaryActionAppealedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DisciplinaryActionAppealedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Disciplinary action appealed: {EmployeeName}, Reason: {AppealReason}",
            notification.EmployeeName,
            notification.AppealReason);

        return Task.CompletedTask;
    }
}

#endregion
