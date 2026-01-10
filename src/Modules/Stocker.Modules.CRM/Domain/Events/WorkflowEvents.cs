using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Workflow Events

/// <summary>
/// Raised when a workflow is created
/// </summary>
public sealed record WorkflowCreatedDomainEvent(
    Guid WorkflowId,
    Guid TenantId,
    string Name,
    string TriggerType) : DomainEvent;

/// <summary>
/// Raised when a workflow is activated
/// </summary>
public sealed record WorkflowActivatedDomainEvent(
    Guid WorkflowId,
    Guid TenantId,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a workflow is deactivated
/// </summary>
public sealed record WorkflowDeactivatedDomainEvent(
    Guid WorkflowId,
    Guid TenantId,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a workflow execution starts
/// </summary>
public sealed record WorkflowExecutionStartedDomainEvent(
    Guid ExecutionId,
    Guid TenantId,
    Guid WorkflowId,
    string EntityType,
    Guid EntityId) : DomainEvent;

/// <summary>
/// Raised when a workflow execution completes
/// </summary>
public sealed record WorkflowExecutionCompletedDomainEvent(
    Guid ExecutionId,
    Guid TenantId,
    Guid WorkflowId,
    string Status,
    int StepsExecuted) : DomainEvent;

/// <summary>
/// Raised when a workflow execution fails
/// </summary>
public sealed record WorkflowExecutionFailedDomainEvent(
    Guid ExecutionId,
    Guid TenantId,
    Guid WorkflowId,
    string WorkflowName,
    string ErrorMessage,
    int FailedStepIndex) : DomainEvent;

#endregion

#region Notification Events

/// <summary>
/// Raised when a notification is sent
/// </summary>
public sealed record NotificationSentDomainEvent(
    Guid NotificationId,
    Guid TenantId,
    int UserId,
    string NotificationType,
    string Channel) : DomainEvent;

/// <summary>
/// Raised when a notification is read
/// </summary>
public sealed record NotificationReadDomainEvent(
    Guid NotificationId,
    Guid TenantId,
    int UserId) : DomainEvent;

#endregion
