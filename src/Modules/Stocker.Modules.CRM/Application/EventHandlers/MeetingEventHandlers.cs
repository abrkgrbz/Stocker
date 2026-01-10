using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Meeting Event Handlers

/// <summary>
/// Handler for meeting scheduled events
/// </summary>
public sealed class MeetingScheduledEventHandler : INotificationHandler<MeetingScheduledDomainEvent>
{
    private readonly ILogger<MeetingScheduledEventHandler> _logger;

    public MeetingScheduledEventHandler(ILogger<MeetingScheduledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(MeetingScheduledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting scheduled: {MeetingId} - {Title}, Time: {StartTime} - {EndTime}",
            notification.MeetingId,
            notification.Title,
            notification.StartTime,
            notification.EndTime);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for meeting updated events
/// </summary>
public sealed class MeetingUpdatedEventHandler : INotificationHandler<MeetingUpdatedDomainEvent>
{
    private readonly ILogger<MeetingUpdatedEventHandler> _logger;

    public MeetingUpdatedEventHandler(ILogger<MeetingUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(MeetingUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting updated: {MeetingId} - {Title}",
            notification.MeetingId,
            notification.Title);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for meeting cancelled events
/// </summary>
public sealed class MeetingCancelledEventHandler : INotificationHandler<MeetingCancelledDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<MeetingCancelledEventHandler> _logger;

    public MeetingCancelledEventHandler(
        ICrmNotificationService notificationService,
        ILogger<MeetingCancelledEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(MeetingCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Meeting cancelled: {MeetingId} - {Title}, Reason: {CancellationReason}",
            notification.MeetingId,
            notification.Title,
            notification.CancellationReason ?? "Not specified");

        await _notificationService.SendMeetingCancelledAsync(
            notification.TenantId,
            notification.MeetingId,
            notification.Title,
            notification.CancelledById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for meeting reminder due events
/// </summary>
public sealed class MeetingReminderDueEventHandler : INotificationHandler<MeetingReminderDueDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<MeetingReminderDueEventHandler> _logger;

    public MeetingReminderDueEventHandler(
        ICrmNotificationService notificationService,
        ILogger<MeetingReminderDueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(MeetingReminderDueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting reminder: {MeetingId} - {Title}, Starts: {StartTime}, Minutes until: {MinutesUntilStart}",
            notification.MeetingId,
            notification.Title,
            notification.StartTime,
            notification.MinutesUntilStart);

        await _notificationService.SendMeetingReminderAsync(
            notification.TenantId,
            notification.MeetingId,
            notification.Title,
            notification.StartTime,
            notification.MinutesUntilStart,
            cancellationToken);
    }
}

/// <summary>
/// Handler for meeting started events
/// </summary>
public sealed class MeetingStartedEventHandler : INotificationHandler<MeetingStartedDomainEvent>
{
    private readonly ILogger<MeetingStartedEventHandler> _logger;

    public MeetingStartedEventHandler(ILogger<MeetingStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(MeetingStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting started: {MeetingId} - {Title}",
            notification.MeetingId,
            notification.Title);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for meeting ended events
/// </summary>
public sealed class MeetingEndedEventHandler : INotificationHandler<MeetingEndedDomainEvent>
{
    private readonly ILogger<MeetingEndedEventHandler> _logger;

    public MeetingEndedEventHandler(ILogger<MeetingEndedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(MeetingEndedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting ended: {MeetingId} - {Title}, Duration: {Duration}",
            notification.MeetingId,
            notification.Title,
            notification.Duration);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for meeting attendee responded events
/// </summary>
public sealed class MeetingAttendeeRespondedEventHandler : INotificationHandler<MeetingAttendeeRespondedDomainEvent>
{
    private readonly ILogger<MeetingAttendeeRespondedEventHandler> _logger;

    public MeetingAttendeeRespondedEventHandler(ILogger<MeetingAttendeeRespondedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(MeetingAttendeeRespondedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting attendee responded: {MeetingId}, Attendee: {AttendeeId}, Response: {Response}",
            notification.MeetingId,
            notification.AttendeeId,
            notification.Response);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for meeting notes added events
/// </summary>
public sealed class MeetingNotesAddedEventHandler : INotificationHandler<MeetingNotesAddedDomainEvent>
{
    private readonly ILogger<MeetingNotesAddedEventHandler> _logger;

    public MeetingNotesAddedEventHandler(ILogger<MeetingNotesAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(MeetingNotesAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Meeting notes added: {MeetingId} - {Title} by user {AddedById}",
            notification.MeetingId,
            notification.Title,
            notification.AddedById);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for recurring meeting created events
/// </summary>
public sealed class RecurringMeetingCreatedEventHandler : INotificationHandler<RecurringMeetingCreatedDomainEvent>
{
    private readonly ILogger<RecurringMeetingCreatedEventHandler> _logger;

    public RecurringMeetingCreatedEventHandler(ILogger<RecurringMeetingCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(RecurringMeetingCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Recurring meeting created: {MeetingId} - {Title}, Pattern: {RecurrencePattern}",
            notification.MeetingId,
            notification.Title,
            notification.RecurrencePattern);

        return Task.CompletedTask;
    }
}

#endregion
