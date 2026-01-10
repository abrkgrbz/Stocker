using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region JobApplication Event Handlers

public class JobApplicationSubmittedEventHandler : INotificationHandler<JobApplicationSubmittedDomainEvent>
{
    private readonly ILogger<JobApplicationSubmittedEventHandler> _logger;

    public JobApplicationSubmittedEventHandler(ILogger<JobApplicationSubmittedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobApplicationSubmittedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Job application submitted: {CandidateName} for {JobTitle}",
            notification.CandidateName,
            notification.JobTitle);

        return Task.CompletedTask;
    }
}

public class JobApplicationShortlistedEventHandler : INotificationHandler<JobApplicationShortlistedDomainEvent>
{
    private readonly ILogger<JobApplicationShortlistedEventHandler> _logger;

    public JobApplicationShortlistedEventHandler(ILogger<JobApplicationShortlistedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobApplicationShortlistedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Candidate shortlisted: {CandidateName} for {JobTitle}",
            notification.CandidateName,
            notification.JobTitle);

        return Task.CompletedTask;
    }
}

public class JobApplicationRejectedEventHandler : INotificationHandler<JobApplicationRejectedDomainEvent>
{
    private readonly ILogger<JobApplicationRejectedEventHandler> _logger;

    public JobApplicationRejectedEventHandler(ILogger<JobApplicationRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JobApplicationRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Application rejected: {CandidateName} for {JobTitle}, Reason: {RejectionReason}",
            notification.CandidateName,
            notification.JobTitle,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

public class CandidateHiredEventHandler : INotificationHandler<CandidateHiredDomainEvent>
{
    private readonly ILogger<CandidateHiredEventHandler> _logger;

    public CandidateHiredEventHandler(ILogger<CandidateHiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CandidateHiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Candidate hired: {CandidateName} for {JobTitle}, Start: {StartDate}",
            notification.CandidateName,
            notification.JobTitle,
            notification.StartDate);

        return Task.CompletedTask;
    }
}

#endregion
