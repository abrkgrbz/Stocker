using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for activity created events
/// </summary>
public sealed class ActivityCreatedEventHandler : INotificationHandler<ActivityCreatedDomainEvent>
{
    private readonly ILogger<ActivityCreatedEventHandler> _logger;

    public ActivityCreatedEventHandler(ILogger<ActivityCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ActivityCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Activity created: {ActivityId} - {Subject} ({ActivityType}), Assigned to: {AssignedToUserId}",
            notification.ActivityId,
            notification.Subject,
            notification.ActivityType,
            notification.AssignedToUserId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for activity completed events
/// </summary>
public sealed class ActivityCompletedEventHandler : INotificationHandler<ActivityCompletedDomainEvent>
{
    private readonly ILogger<ActivityCompletedEventHandler> _logger;

    public ActivityCompletedEventHandler(ILogger<ActivityCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ActivityCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Activity completed: {ActivityId} - {Subject} ({ActivityType}) at {CompletedDate}",
            notification.ActivityId,
            notification.Subject,
            notification.ActivityType,
            notification.CompletedDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for activity cancelled events
/// </summary>
public sealed class ActivityCancelledEventHandler : INotificationHandler<ActivityCancelledDomainEvent>
{
    private readonly ILogger<ActivityCancelledEventHandler> _logger;

    public ActivityCancelledEventHandler(ILogger<ActivityCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ActivityCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Activity cancelled: {ActivityId} - {Subject}, Reason: {Reason}",
            notification.ActivityId,
            notification.Subject,
            notification.Reason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for activity overdue events - sends alert to assigned user
/// </summary>
public sealed class ActivityOverdueEventHandler : INotificationHandler<ActivityOverdueDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ActivityOverdueEventHandler> _logger;

    public ActivityOverdueEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ActivityOverdueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ActivityOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⚠️ Activity OVERDUE: {ActivityId} - {Subject}, Due: {DueDate:d}, {DaysOverdue} days overdue, " +
            "Assigned to: {AssignedToUserId}",
            notification.ActivityId,
            notification.Subject,
            notification.DueDate,
            notification.DaysOverdue,
            notification.AssignedToUserId);

        // Send alert to assigned user
        await _notificationService.SendActivityOverdueAsync(
            notification.TenantId,
            notification.ActivityId,
            notification.Subject,
            notification.DueDate,
            notification.DaysOverdue,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for activity rescheduled events
/// </summary>
public sealed class ActivityRescheduledEventHandler : INotificationHandler<ActivityRescheduledDomainEvent>
{
    private readonly ILogger<ActivityRescheduledEventHandler> _logger;

    public ActivityRescheduledEventHandler(ILogger<ActivityRescheduledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ActivityRescheduledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Activity rescheduled: {ActivityId} - Due date: {OldDueDate:d} → {NewDueDate:d}",
            notification.ActivityId,
            notification.OldDueDate,
            notification.NewDueDate);

        return Task.CompletedTask;
    }
}

