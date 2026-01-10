using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Interview Event Handlers

public class InterviewScheduledEventHandler : INotificationHandler<InterviewScheduledDomainEvent>
{
    private readonly ILogger<InterviewScheduledEventHandler> _logger;

    public InterviewScheduledEventHandler(ILogger<InterviewScheduledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InterviewScheduledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Interview scheduled: {CandidateName}, Type: {InterviewType}, Date: {ScheduledDate}",
            notification.CandidateName,
            notification.InterviewType,
            notification.ScheduledDate);

        return Task.CompletedTask;
    }
}

public class InterviewCompletedEventHandler : INotificationHandler<InterviewCompletedDomainEvent>
{
    private readonly ILogger<InterviewCompletedEventHandler> _logger;

    public InterviewCompletedEventHandler(ILogger<InterviewCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InterviewCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Interview completed: {CandidateName}, Result: {Result}, Rating: {Rating}",
            notification.CandidateName,
            notification.Result,
            notification.Rating?.ToString() ?? "N/A");

        return Task.CompletedTask;
    }
}

public class InterviewCancelledEventHandler : INotificationHandler<InterviewCancelledDomainEvent>
{
    private readonly ILogger<InterviewCancelledEventHandler> _logger;

    public InterviewCancelledEventHandler(ILogger<InterviewCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InterviewCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Interview cancelled: {CandidateName}, Reason: {CancellationReason}",
            notification.CandidateName,
            notification.CancellationReason);

        return Task.CompletedTask;
    }
}

#endregion
