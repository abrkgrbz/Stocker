using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Department Event Handlers

public class DepartmentCreatedEventHandler : INotificationHandler<DepartmentCreatedDomainEvent>
{
    private readonly ILogger<DepartmentCreatedEventHandler> _logger;

    public DepartmentCreatedEventHandler(ILogger<DepartmentCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DepartmentCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Department created: {Code} - {Name}",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

public class DepartmentManagerAssignedEventHandler : INotificationHandler<DepartmentManagerAssignedDomainEvent>
{
    private readonly ILogger<DepartmentManagerAssignedEventHandler> _logger;

    public DepartmentManagerAssignedEventHandler(ILogger<DepartmentManagerAssignedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DepartmentManagerAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Department manager assigned: {DepartmentName} → {ManagerName}",
            notification.DepartmentName,
            notification.NewManagerName);

        return Task.CompletedTask;
    }
}

public class DepartmentDeactivatedEventHandler : INotificationHandler<DepartmentDeactivatedDomainEvent>
{
    private readonly ILogger<DepartmentDeactivatedEventHandler> _logger;

    public DepartmentDeactivatedEventHandler(ILogger<DepartmentDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DepartmentDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Department deactivated: {Name}, Affected employees: {EmployeeCount}",
            notification.Name,
            notification.EmployeeCount);

        return Task.CompletedTask;
    }
}

#endregion
