using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region JobPosting Event Handlers

public class JobPostingCreatedEventHandler : INotificationHandler<JobPostingCreatedDomainEvent>
{
    private readonly ILogger<JobPostingCreatedEventHandler> _logger;

    public JobPostingCreatedEventHandler(ILogger<JobPostingCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobPostingCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Job posting created: {Title}, Open: {OpenDate}",
            notification.Title,
            notification.OpenDate);

        return Task.CompletedTask;
    }
}

public class JobPostingPublishedEventHandler : INotificationHandler<JobPostingPublishedDomainEvent>
{
    private readonly ILogger<JobPostingPublishedEventHandler> _logger;

    public JobPostingPublishedEventHandler(ILogger<JobPostingPublishedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobPostingPublishedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Job posting published: {Title}",
            notification.Title);

        return Task.CompletedTask;
    }
}

public class JobPostingClosedEventHandler : INotificationHandler<JobPostingClosedDomainEvent>
{
    private readonly ILogger<JobPostingClosedEventHandler> _logger;

    public JobPostingClosedEventHandler(ILogger<JobPostingClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobPostingClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Job posting closed: {Title}, Applications: {ApplicationCount}",
            notification.Title,
            notification.ApplicationCount);

        return Task.CompletedTask;
    }
}

public class JobPostingFilledEventHandler : INotificationHandler<JobPostingFilledDomainEvent>
{
    private readonly ILogger<JobPostingFilledEventHandler> _logger;

    public JobPostingFilledEventHandler(ILogger<JobPostingFilledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobPostingFilledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Job posting filled: {Title} → {HiredCandidateName}",
            notification.Title,
            notification.HiredCandidateName);

        return Task.CompletedTask;
    }
}

#endregion
