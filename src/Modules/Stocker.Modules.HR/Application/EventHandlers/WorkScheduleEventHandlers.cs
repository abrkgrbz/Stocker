using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region WorkSchedule Event Handlers

public class WorkScheduleCreatedEventHandler : INotificationHandler<WorkScheduleCreatedDomainEvent>
{
    private readonly ILogger<WorkScheduleCreatedEventHandler> _logger;

    public WorkScheduleCreatedEventHandler(ILogger<WorkScheduleCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkScheduleCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work schedule created: {Name}, Weekly Hours: {WeeklyHours}, Work Days: {WorkDays}",
            notification.Name,
            notification.WeeklyHours,
            notification.WorkDays);

        return Task.CompletedTask;
    }
}

public class WorkScheduleUpdatedEventHandler : INotificationHandler<WorkScheduleUpdatedDomainEvent>
{
    private readonly ILogger<WorkScheduleUpdatedEventHandler> _logger;

    public WorkScheduleUpdatedEventHandler(ILogger<WorkScheduleUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkScheduleUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work schedule updated: {Name}, Weekly Hours: {WeeklyHours}",
            notification.Name,
            notification.WeeklyHours);

        return Task.CompletedTask;
    }
}

public class EmployeeAssignedToWorkScheduleEventHandler : INotificationHandler<EmployeeAssignedToWorkScheduleDomainEvent>
{
    private readonly ILogger<EmployeeAssignedToWorkScheduleEventHandler> _logger;

    public EmployeeAssignedToWorkScheduleEventHandler(ILogger<EmployeeAssignedToWorkScheduleEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeAssignedToWorkScheduleDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee assigned to work schedule: {EmployeeName} → {ScheduleName}, Effective: {EffectiveDate:d}",
            notification.EmployeeName,
            notification.ScheduleName,
            notification.EffectiveDate);

        return Task.CompletedTask;
    }
}

public class WorkScheduleSetAsDefaultEventHandler : INotificationHandler<WorkScheduleSetAsDefaultDomainEvent>
{
    private readonly ILogger<WorkScheduleSetAsDefaultEventHandler> _logger;

    public WorkScheduleSetAsDefaultEventHandler(ILogger<WorkScheduleSetAsDefaultEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkScheduleSetAsDefaultDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work schedule set as default: {Name}",
            notification.Name);

        return Task.CompletedTask;
    }
}

public class WorkScheduleDeactivatedEventHandler : INotificationHandler<WorkScheduleDeactivatedDomainEvent>
{
    private readonly ILogger<WorkScheduleDeactivatedEventHandler> _logger;

    public WorkScheduleDeactivatedEventHandler(ILogger<WorkScheduleDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkScheduleDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work schedule deactivated: {Name}, Affected Employees: {AffectedEmployeeCount}",
            notification.Name,
            notification.AffectedEmployeeCount);

        return Task.CompletedTask;
    }
}

#endregion
