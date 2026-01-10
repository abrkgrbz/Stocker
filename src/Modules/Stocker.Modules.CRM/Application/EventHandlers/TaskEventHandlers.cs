using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Task Event Handlers

/// <summary>
/// Handler for task created events
/// </summary>
public sealed class CrmTaskCreatedEventHandler : INotificationHandler<TaskCreatedDomainEvent>
{
    private readonly ILogger<CrmTaskCreatedEventHandler> _logger;

    public CrmTaskCreatedEventHandler(ILogger<CrmTaskCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaskCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task created: {TaskId} - {Subject}, Priority: {Priority}, Due: {DueDate}",
            notification.TaskId,
            notification.Subject,
            notification.Priority,
            notification.DueDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for task assigned events
/// </summary>
public sealed class CrmTaskAssignedEventHandler : INotificationHandler<TaskAssignedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CrmTaskAssignedEventHandler> _logger;

    public CrmTaskAssignedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CrmTaskAssignedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TaskAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task assigned: {TaskId} ({Subject}) → User {AssignedToUserId}",
            notification.TaskId,
            notification.Subject,
            notification.AssignedToUserId);

        await _notificationService.SendTaskAssignedAsync(
            notification.TenantId,
            notification.TaskId,
            notification.Subject,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for task status changed events
/// </summary>
public sealed class CrmTaskStatusChangedEventHandler : INotificationHandler<TaskStatusChangedDomainEvent>
{
    private readonly ILogger<CrmTaskStatusChangedEventHandler> _logger;

    public CrmTaskStatusChangedEventHandler(ILogger<CrmTaskStatusChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaskStatusChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task status changed: {TaskId} - {OldStatus} → {NewStatus}",
            notification.TaskId,
            notification.OldStatus,
            notification.NewStatus);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for task completed events
/// </summary>
public sealed class CrmTaskCompletedEventHandler : INotificationHandler<TaskCompletedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CrmTaskCompletedEventHandler> _logger;

    public CrmTaskCompletedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CrmTaskCompletedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TaskCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task completed: {TaskId} - {Subject}",
            notification.TaskId,
            notification.Subject);

        await _notificationService.SendTaskCompletedAsync(
            notification.TenantId,
            notification.TaskId,
            notification.Subject,
            notification.CompletedById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for task overdue events
/// </summary>
public sealed class CrmTaskOverdueEventHandler : INotificationHandler<TaskOverdueDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CrmTaskOverdueEventHandler> _logger;

    public CrmTaskOverdueEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CrmTaskOverdueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TaskOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Task overdue: {TaskId} - {Subject}, Due: {DueDate}, Days overdue: {DaysOverdue}",
            notification.TaskId,
            notification.Subject,
            notification.DueDate,
            notification.DaysOverdue);

        await _notificationService.SendTaskOverdueAsync(
            notification.TenantId,
            notification.TaskId,
            notification.Subject,
            notification.OwnerId,
            notification.DaysOverdue,
            cancellationToken);
    }
}

/// <summary>
/// Handler for task reminder due events
/// </summary>
public sealed class CrmTaskReminderDueEventHandler : INotificationHandler<TaskReminderDueDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CrmTaskReminderDueEventHandler> _logger;

    public CrmTaskReminderDueEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CrmTaskReminderDueEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TaskReminderDueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task reminder: {TaskId} - {Subject}",
            notification.TaskId,
            notification.Subject);

        await _notificationService.SendTaskReminderAsync(
            notification.TenantId,
            notification.TaskId,
            notification.Subject,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for task due date approaching events
/// </summary>
public sealed class CrmTaskDueDateApproachingEventHandler : INotificationHandler<TaskDueDateApproachingDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CrmTaskDueDateApproachingEventHandler> _logger;

    public CrmTaskDueDateApproachingEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CrmTaskDueDateApproachingEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TaskDueDateApproachingDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Task due date approaching: {TaskId} - {Subject}, Due in: {DaysRemaining} days",
            notification.TaskId,
            notification.Subject,
            notification.DaysRemaining);

        await _notificationService.SendTaskDueDateApproachingAsync(
            notification.TenantId,
            notification.TaskId,
            notification.Subject,
            notification.OwnerId,
            notification.DaysRemaining,
            cancellationToken);
    }
}

/// <summary>
/// Handler for task priority changed events
/// </summary>
public sealed class CrmTaskPriorityChangedEventHandler : INotificationHandler<TaskPriorityChangedDomainEvent>
{
    private readonly ILogger<CrmTaskPriorityChangedEventHandler> _logger;

    public CrmTaskPriorityChangedEventHandler(ILogger<CrmTaskPriorityChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaskPriorityChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task priority changed: {TaskId} - {OldPriority} → {NewPriority}",
            notification.TaskId,
            notification.OldPriority,
            notification.NewPriority);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for task cancelled events
/// </summary>
public sealed class CrmTaskCancelledEventHandler : INotificationHandler<TaskCancelledDomainEvent>
{
    private readonly ILogger<CrmTaskCancelledEventHandler> _logger;

    public CrmTaskCancelledEventHandler(ILogger<CrmTaskCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaskCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Task cancelled: {TaskId} - {Subject}, Reason: {CancellationReason}",
            notification.TaskId,
            notification.Subject,
            notification.CancellationReason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for task comment added events
/// </summary>
public sealed class CrmTaskCommentAddedEventHandler : INotificationHandler<TaskCommentAddedDomainEvent>
{
    private readonly ILogger<CrmTaskCommentAddedEventHandler> _logger;

    public CrmTaskCommentAddedEventHandler(ILogger<CrmTaskCommentAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaskCommentAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Task comment added: {TaskId} by user {CommentById}",
            notification.TaskId,
            notification.CommentById);

        return Task.CompletedTask;
    }
}

#endregion
