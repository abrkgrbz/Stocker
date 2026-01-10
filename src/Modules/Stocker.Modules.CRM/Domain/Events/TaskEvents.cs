using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Task Events

/// <summary>
/// Raised when a new task is created
/// </summary>
public sealed record TaskCreatedDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string Priority,
    DateTime? DueDate,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    int OwnerId,
    List<int> AssignedUserIds) : DomainEvent;

/// <summary>
/// Raised when a task is assigned
/// </summary>
public sealed record TaskAssignedDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string Priority,
    DateTime? DueDate,
    int AssignedToUserId,
    int AssignedById) : DomainEvent;

/// <summary>
/// Raised when task status changes
/// </summary>
public sealed record TaskStatusChangedDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string OldStatus,
    string NewStatus,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when a task is completed
/// </summary>
public sealed record TaskCompletedDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    DateTime CompletedDate,
    int CompletedById,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a task is overdue
/// </summary>
public sealed record TaskOverdueDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string Priority,
    DateTime DueDate,
    int DaysOverdue,
    int OwnerId,
    List<int> AssignedUserIds) : DomainEvent;

/// <summary>
/// Raised when a task reminder is due
/// </summary>
public sealed record TaskReminderDueDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string Priority,
    DateTime? DueDate,
    DateTime ReminderDate,
    int OwnerId,
    List<int> AssignedUserIds) : DomainEvent;

/// <summary>
/// Raised when a task due date is approaching
/// </summary>
public sealed record TaskDueDateApproachingDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string Priority,
    DateTime DueDate,
    int DaysRemaining,
    int OwnerId,
    List<int> AssignedUserIds) : DomainEvent;

/// <summary>
/// Raised when task priority changes
/// </summary>
public sealed record TaskPriorityChangedDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string OldPriority,
    string NewPriority,
    int ChangedById) : DomainEvent;

/// <summary>
/// Raised when a task is cancelled
/// </summary>
public sealed record TaskCancelledDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    string? CancellationReason,
    int CancelledById,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a task comment is added
/// </summary>
public sealed record TaskCommentAddedDomainEvent(
    Guid TaskId,
    Guid TenantId,
    string Subject,
    int CommentById,
    int OwnerId,
    List<int> AssignedUserIds) : DomainEvent;

#endregion
