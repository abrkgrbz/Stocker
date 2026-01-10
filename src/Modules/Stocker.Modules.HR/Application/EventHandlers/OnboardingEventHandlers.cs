using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Onboarding Event Handlers

public class OnboardingStartedEventHandler : INotificationHandler<OnboardingStartedDomainEvent>
{
    private readonly ILogger<OnboardingStartedEventHandler> _logger;

    public OnboardingStartedEventHandler(ILogger<OnboardingStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OnboardingStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Onboarding started: {EmployeeName}, Tasks: {TaskCount}",
            notification.EmployeeName,
            notification.TaskCount);

        return Task.CompletedTask;
    }
}

public class OnboardingCompletedEventHandler : INotificationHandler<OnboardingCompletedDomainEvent>
{
    private readonly ILogger<OnboardingCompletedEventHandler> _logger;

    public OnboardingCompletedEventHandler(ILogger<OnboardingCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OnboardingCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Onboarding completed: {EmployeeName}, Days: {DaysToComplete}",
            notification.EmployeeName,
            notification.DaysToComplete);

        return Task.CompletedTask;
    }
}

public class OnboardingOverdueEventHandler : INotificationHandler<OnboardingOverdueDomainEvent>
{
    private readonly ILogger<OnboardingOverdueEventHandler> _logger;

    public OnboardingOverdueEventHandler(ILogger<OnboardingOverdueEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OnboardingOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Onboarding overdue: {EmployeeName}, Overdue tasks: {OverdueTasks}, Days: {DaysOverdue}",
            notification.EmployeeName,
            notification.OverdueTasks,
            notification.DaysOverdue);

        return Task.CompletedTask;
    }
}

#endregion
