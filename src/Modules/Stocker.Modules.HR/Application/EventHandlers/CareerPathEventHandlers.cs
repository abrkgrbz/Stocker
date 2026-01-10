using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region CareerPath Event Handlers

public class CareerPathCreatedEventHandler : INotificationHandler<CareerPathCreatedDomainEvent>
{
    private readonly ILogger<CareerPathCreatedEventHandler> _logger;

    public CareerPathCreatedEventHandler(ILogger<CareerPathCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CareerPathCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Career path created: {Name}, Starting Position: {StartingPositionId}",
            notification.Name,
            notification.StartingPositionId);

        return Task.CompletedTask;
    }
}

public class EmployeeAssignedToCareerPathEventHandler : INotificationHandler<EmployeeAssignedToCareerPathDomainEvent>
{
    private readonly ILogger<EmployeeAssignedToCareerPathEventHandler> _logger;

    public EmployeeAssignedToCareerPathEventHandler(ILogger<EmployeeAssignedToCareerPathEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmployeeAssignedToCareerPathDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee assigned to career path: {EmployeeName} → {CareerPathName}",
            notification.EmployeeName,
            notification.CareerPathName);

        return Task.CompletedTask;
    }
}

public class CareerPathMilestoneCompletedEventHandler : INotificationHandler<CareerPathMilestoneCompletedDomainEvent>
{
    private readonly ILogger<CareerPathMilestoneCompletedEventHandler> _logger;

    public CareerPathMilestoneCompletedEventHandler(ILogger<CareerPathMilestoneCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CareerPathMilestoneCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Career path milestone completed: {EmployeeName} - {MilestoneName}, Progress: {CompletedMilestones}/{TotalMilestones}",
            notification.EmployeeName,
            notification.MilestoneName,
            notification.CompletedMilestones,
            notification.TotalMilestones);

        return Task.CompletedTask;
    }
}

public class CareerPathCompletedEventHandler : INotificationHandler<CareerPathCompletedDomainEvent>
{
    private readonly ILogger<CareerPathCompletedEventHandler> _logger;

    public CareerPathCompletedEventHandler(ILogger<CareerPathCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CareerPathCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Career path completed: {EmployeeName} finished {CareerPathName}",
            notification.EmployeeName,
            notification.CareerPathName);

        return Task.CompletedTask;
    }
}

public class CareerPathProgressUpdatedEventHandler : INotificationHandler<CareerPathProgressUpdatedDomainEvent>
{
    private readonly ILogger<CareerPathProgressUpdatedEventHandler> _logger;

    public CareerPathProgressUpdatedEventHandler(ILogger<CareerPathProgressUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CareerPathProgressUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Career path progress updated: {EmployeeName}, Progress: {ProgressPercentage:P}",
            notification.EmployeeName,
            notification.ProgressPercentage / 100);

        return Task.CompletedTask;
    }
}

#endregion
