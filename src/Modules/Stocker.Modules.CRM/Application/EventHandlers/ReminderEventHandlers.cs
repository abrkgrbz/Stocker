using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Reminder Event Handlers

/// <summary>
/// Handler for reminder created events
/// </summary>
public sealed class ReminderCreatedEventHandler : INotificationHandler<ReminderCreatedDomainEvent>
{
    private readonly ILogger<ReminderCreatedEventHandler> _logger;

    public ReminderCreatedEventHandler(ILogger<ReminderCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReminderCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reminder created: {ReminderId} - {Title}, Due: {RemindAt}",
            notification.ReminderId,
            notification.Title,
            notification.RemindAt);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for reminder due events
/// </summary>
public sealed class ReminderDueEventHandler : INotificationHandler<ReminderDueDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ReminderDueEventHandler> _logger;

    public ReminderDueEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ReminderDueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ReminderDueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reminder due: {ReminderId} - {Title} for user {UserId}",
            notification.ReminderId,
            notification.Title,
            notification.UserId);

        await _notificationService.SendReminderDueAsync(
            notification.TenantId,
            notification.ReminderId,
            notification.Title,
            notification.UserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for reminder snoozed events
/// </summary>
public sealed class ReminderSnoozedEventHandler : INotificationHandler<ReminderSnoozedDomainEvent>
{
    private readonly ILogger<ReminderSnoozedEventHandler> _logger;

    public ReminderSnoozedEventHandler(ILogger<ReminderSnoozedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReminderSnoozedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reminder snoozed: {ReminderId} - {Title}, New time: {SnoozedUntil}",
            notification.ReminderId,
            notification.Title,
            notification.SnoozedUntil);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for reminder completed events
/// </summary>
public sealed class ReminderCompletedEventHandler : INotificationHandler<ReminderCompletedDomainEvent>
{
    private readonly ILogger<ReminderCompletedEventHandler> _logger;

    public ReminderCompletedEventHandler(ILogger<ReminderCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReminderCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reminder completed: {ReminderId} - {Title}",
            notification.ReminderId,
            notification.Title);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for reminder dismissed events
/// </summary>
public sealed class ReminderDismissedEventHandler : INotificationHandler<ReminderDismissedDomainEvent>
{
    private readonly ILogger<ReminderDismissedEventHandler> _logger;

    public ReminderDismissedEventHandler(ILogger<ReminderDismissedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReminderDismissedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Reminder dismissed: {ReminderId} - {Title}",
            notification.ReminderId,
            notification.Title);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for recurring reminder triggered events
/// </summary>
public sealed class RecurringReminderTriggeredEventHandler : INotificationHandler<RecurringReminderTriggeredDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<RecurringReminderTriggeredEventHandler> _logger;

    public RecurringReminderTriggeredEventHandler(
        ICrmNotificationService notificationService,
        ILogger<RecurringReminderTriggeredEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(RecurringReminderTriggeredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Recurring reminder triggered: {ReminderId} - {Title}, Next: {NextRemindAt}",
            notification.ReminderId,
            notification.Title,
            notification.NextRemindAt);

        await _notificationService.SendReminderDueAsync(
            notification.TenantId,
            notification.ReminderId,
            notification.Title,
            notification.UserId,
            cancellationToken);
    }
}

#endregion
