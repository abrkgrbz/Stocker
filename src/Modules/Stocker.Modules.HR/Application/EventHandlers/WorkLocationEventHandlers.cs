using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region WorkLocation Event Handlers

public class WorkLocationCreatedEventHandler : INotificationHandler<WorkLocationCreatedDomainEvent>
{
    private readonly ILogger<WorkLocationCreatedEventHandler> _logger;

    public WorkLocationCreatedEventHandler(ILogger<WorkLocationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkLocationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work location created: {Name} ({Code}), City: {City}, Country: {Country}",
            notification.Name,
            notification.Code,
            notification.City ?? "N/A",
            notification.Country ?? "N/A");

        return Task.CompletedTask;
    }
}

public class WorkLocationUpdatedEventHandler : INotificationHandler<WorkLocationUpdatedDomainEvent>
{
    private readonly ILogger<WorkLocationUpdatedEventHandler> _logger;

    public WorkLocationUpdatedEventHandler(ILogger<WorkLocationUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkLocationUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work location updated: {Name} ({Code})",
            notification.Name,
            notification.Code);

        return Task.CompletedTask;
    }
}

public class EmployeeAssignedToWorkLocationEventHandler : INotificationHandler<EmployeeAssignedToWorkLocationDomainEvent>
{
    private readonly ILogger<EmployeeAssignedToWorkLocationEventHandler> _logger;

    public EmployeeAssignedToWorkLocationEventHandler(ILogger<EmployeeAssignedToWorkLocationEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeAssignedToWorkLocationDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee assigned to work location: {EmployeeName} → {LocationName}",
            notification.EmployeeName,
            notification.LocationName);

        return Task.CompletedTask;
    }
}

public class WorkLocationClosedEventHandler : INotificationHandler<WorkLocationClosedDomainEvent>
{
    private readonly ILogger<WorkLocationClosedEventHandler> _logger;

    public WorkLocationClosedEventHandler(ILogger<WorkLocationClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkLocationClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Work location closed: {Name}, Affected Employees: {AffectedEmployeeCount}, Reason: {ClosureReason}",
            notification.Name,
            notification.AffectedEmployeeCount,
            notification.ClosureReason);

        return Task.CompletedTask;
    }
}

public class WorkLocationSetAsHeadquartersEventHandler : INotificationHandler<WorkLocationSetAsHeadquartersDomainEvent>
{
    private readonly ILogger<WorkLocationSetAsHeadquartersEventHandler> _logger;

    public WorkLocationSetAsHeadquartersEventHandler(ILogger<WorkLocationSetAsHeadquartersEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkLocationSetAsHeadquartersDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Work location set as headquarters: {Name}",
            notification.Name);

        return Task.CompletedTask;
    }
}

#endregion
