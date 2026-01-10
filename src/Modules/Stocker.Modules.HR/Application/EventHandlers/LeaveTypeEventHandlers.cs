using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region LeaveType Event Handlers

public class LeaveTypeCreatedEventHandler : INotificationHandler<LeaveTypeCreatedDomainEvent>
{
    private readonly ILogger<LeaveTypeCreatedEventHandler> _logger;

    public LeaveTypeCreatedEventHandler(ILogger<LeaveTypeCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveTypeCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave type created: {Name} ({Code}), Default Days: {DefaultDays}, Paid: {IsPaid}",
            notification.Name,
            notification.Code,
            notification.DefaultDays,
            notification.IsPaid);

        return Task.CompletedTask;
    }
}

public class LeaveTypeUpdatedEventHandler : INotificationHandler<LeaveTypeUpdatedDomainEvent>
{
    private readonly ILogger<LeaveTypeUpdatedEventHandler> _logger;

    public LeaveTypeUpdatedEventHandler(ILogger<LeaveTypeUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveTypeUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave type updated: {Name} ({Code}), Default Days: {DefaultDays}",
            notification.Name,
            notification.Code,
            notification.DefaultDays);

        return Task.CompletedTask;
    }
}

public class LeaveTypeActivatedEventHandler : INotificationHandler<LeaveTypeActivatedDomainEvent>
{
    private readonly ILogger<LeaveTypeActivatedEventHandler> _logger;

    public LeaveTypeActivatedEventHandler(ILogger<LeaveTypeActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveTypeActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave type activated: {Name}",
            notification.Name);

        return Task.CompletedTask;
    }
}

public class LeaveTypeDeactivatedEventHandler : INotificationHandler<LeaveTypeDeactivatedDomainEvent>
{
    private readonly ILogger<LeaveTypeDeactivatedEventHandler> _logger;

    public LeaveTypeDeactivatedEventHandler(ILogger<LeaveTypeDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LeaveTypeDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Leave type deactivated: {Name}",
            notification.Name);

        return Task.CompletedTask;
    }
}

#endregion
