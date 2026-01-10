using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Shift Event Handlers

public class ShiftCreatedEventHandler : INotificationHandler<ShiftCreatedDomainEvent>
{
    private readonly ILogger<ShiftCreatedEventHandler> _logger;

    public ShiftCreatedEventHandler(ILogger<ShiftCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ShiftCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Shift created: {Name}, {StartTime} - {EndTime}, Hours: {WorkHours}",
            notification.Name,
            notification.StartTime,
            notification.EndTime,
            notification.WorkHours);

        return Task.CompletedTask;
    }
}

public class EmployeeAssignedToShiftEventHandler : INotificationHandler<EmployeeAssignedToShiftDomainEvent>
{
    private readonly ILogger<EmployeeAssignedToShiftEventHandler> _logger;

    public EmployeeAssignedToShiftEventHandler(ILogger<EmployeeAssignedToShiftEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeAssignedToShiftDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee assigned to shift: {EmployeeName} → {ShiftName}",
            notification.EmployeeName,
            notification.ShiftName);

        return Task.CompletedTask;
    }
}

public class EmployeeShiftChangedEventHandler : INotificationHandler<EmployeeShiftChangedDomainEvent>
{
    private readonly ILogger<EmployeeShiftChangedEventHandler> _logger;

    public EmployeeShiftChangedEventHandler(ILogger<EmployeeShiftChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeShiftChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee shift changed: {EmployeeName}, {OldShiftName} → {NewShiftName}",
            notification.EmployeeName,
            notification.OldShiftName,
            notification.NewShiftName);

        return Task.CompletedTask;
    }
}

#endregion
