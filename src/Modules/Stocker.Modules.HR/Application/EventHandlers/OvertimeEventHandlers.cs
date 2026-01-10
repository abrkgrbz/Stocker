using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Overtime Event Handlers

public class OvertimeRequestedEventHandler : INotificationHandler<OvertimeRequestedDomainEvent>
{
    private readonly ILogger<OvertimeRequestedEventHandler> _logger;

    public OvertimeRequestedEventHandler(ILogger<OvertimeRequestedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OvertimeRequestedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Overtime requested: {EmployeeName}, Hours: {Hours}, Date: {OvertimeDate}",
            notification.EmployeeName,
            notification.Hours,
            notification.OvertimeDate);

        return Task.CompletedTask;
    }
}

public class OvertimeApprovedEventHandler : INotificationHandler<OvertimeApprovedDomainEvent>
{
    private readonly ILogger<OvertimeApprovedEventHandler> _logger;

    public OvertimeApprovedEventHandler(ILogger<OvertimeApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OvertimeApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Overtime approved: {EmployeeName}, Hours: {Hours}",
            notification.EmployeeName,
            notification.Hours);

        return Task.CompletedTask;
    }
}

public class OvertimeRejectedEventHandler : INotificationHandler<OvertimeRejectedDomainEvent>
{
    private readonly ILogger<OvertimeRejectedEventHandler> _logger;

    public OvertimeRejectedEventHandler(ILogger<OvertimeRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OvertimeRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Overtime rejected: {EmployeeName}, Reason: {RejectionReason}",
            notification.EmployeeName,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

#endregion
