using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for workflow created events
/// </summary>
public sealed class WorkflowCreatedEventHandler : INotificationHandler<WorkflowCreatedDomainEvent>
{
    private readonly ILogger<WorkflowCreatedEventHandler> _logger;

    public WorkflowCreatedEventHandler(ILogger<WorkflowCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkflowCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Workflow created: {WorkflowId} - {Name}, Trigger: {TriggerType}",
            notification.WorkflowId,
            notification.Name,
            notification.TriggerType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for workflow activated events
/// </summary>
public sealed class WorkflowActivatedEventHandler : INotificationHandler<WorkflowActivatedDomainEvent>
{
    private readonly ILogger<WorkflowActivatedEventHandler> _logger;

    public WorkflowActivatedEventHandler(ILogger<WorkflowActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkflowActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Workflow activated: {WorkflowId} - {Name}",
            notification.WorkflowId,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for workflow deactivated events
/// </summary>
public sealed class WorkflowDeactivatedEventHandler : INotificationHandler<WorkflowDeactivatedDomainEvent>
{
    private readonly ILogger<WorkflowDeactivatedEventHandler> _logger;

    public WorkflowDeactivatedEventHandler(ILogger<WorkflowDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkflowDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Workflow deactivated: {WorkflowId} - {Name}",
            notification.WorkflowId,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for workflow execution started events
/// </summary>
public sealed class WorkflowExecutionStartedEventHandler : INotificationHandler<WorkflowExecutionStartedDomainEvent>
{
    private readonly ILogger<WorkflowExecutionStartedEventHandler> _logger;

    public WorkflowExecutionStartedEventHandler(ILogger<WorkflowExecutionStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkflowExecutionStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Workflow execution started: {ExecutionId} - Workflow {WorkflowId}, " +
            "Entity: {EntityType} {EntityId}",
            notification.ExecutionId,
            notification.WorkflowId,
            notification.EntityType,
            notification.EntityId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for workflow execution completed events
/// </summary>
public sealed class WorkflowExecutionCompletedEventHandler : INotificationHandler<WorkflowExecutionCompletedDomainEvent>
{
    private readonly ILogger<WorkflowExecutionCompletedEventHandler> _logger;

    public WorkflowExecutionCompletedEventHandler(ILogger<WorkflowExecutionCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkflowExecutionCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "✅ Workflow execution completed: {ExecutionId} - Workflow {WorkflowId}, " +
            "Status: {Status}, Steps executed: {StepsExecuted}",
            notification.ExecutionId,
            notification.WorkflowId,
            notification.Status,
            notification.StepsExecuted);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for workflow execution failed events - sends notification to tenant
/// </summary>
public sealed class WorkflowExecutionFailedEventHandler : INotificationHandler<WorkflowExecutionFailedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<WorkflowExecutionFailedEventHandler> _logger;

    public WorkflowExecutionFailedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<WorkflowExecutionFailedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(WorkflowExecutionFailedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogError(
            "❌ Workflow execution FAILED: {ExecutionId} - Workflow {WorkflowId} ({WorkflowName}), " +
            "Failed at step {FailedStepIndex}: {ErrorMessage}",
            notification.ExecutionId,
            notification.WorkflowId,
            notification.WorkflowName,
            notification.FailedStepIndex,
            notification.ErrorMessage);

        // Send notification to tenant about workflow failure
        await _notificationService.SendWorkflowExecutionFailedAsync(
            notification.TenantId,
            notification.WorkflowId,
            notification.WorkflowName,
            notification.ExecutionId,
            notification.ErrorMessage,
            cancellationToken);
    }
}

/// <summary>
/// Handler for notification sent events
/// </summary>
public sealed class NotificationSentEventHandler : INotificationHandler<NotificationSentDomainEvent>
{
    private readonly ILogger<NotificationSentEventHandler> _logger;

    public NotificationSentEventHandler(ILogger<NotificationSentEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NotificationSentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Notification sent: {NotificationId} - Type: {NotificationType}, Channel: {Channel}, User: {UserId}",
            notification.NotificationId,
            notification.NotificationType,
            notification.Channel,
            notification.UserId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for notification read events
/// </summary>
public sealed class NotificationReadEventHandler : INotificationHandler<NotificationReadDomainEvent>
{
    private readonly ILogger<NotificationReadEventHandler> _logger;

    public NotificationReadEventHandler(ILogger<NotificationReadEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NotificationReadDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogDebug(
            "Notification read: {NotificationId} by User {UserId}",
            notification.NotificationId,
            notification.UserId);

        return Task.CompletedTask;
    }
}
