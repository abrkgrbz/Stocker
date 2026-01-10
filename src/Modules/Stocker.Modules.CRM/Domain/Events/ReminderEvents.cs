using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Reminder Events

/// <summary>
/// Raised when a new reminder is created
/// </summary>
public sealed record ReminderCreatedDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    string Title,
    DateTime RemindAt,
    string ReminderType,
    string? RelatedEntityType,
    int? RelatedEntityId,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a reminder is due
/// </summary>
public sealed record ReminderDueDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    string Title,
    string? Description,
    string ReminderType,
    string? RelatedEntityType,
    int? RelatedEntityId,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a reminder is snoozed
/// </summary>
public sealed record ReminderSnoozedDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    string Title,
    DateTime OriginalRemindAt,
    DateTime SnoozedUntil,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a reminder is completed
/// </summary>
public sealed record ReminderCompletedDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    string Title,
    DateTime CompletedAt,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a reminder is dismissed
/// </summary>
public sealed record ReminderDismissedDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    string Title,
    int UserId) : DomainEvent;

/// <summary>
/// Raised when a recurring reminder is triggered
/// </summary>
public sealed record RecurringReminderTriggeredDomainEvent(
    Guid ReminderId,
    Guid TenantId,
    string Title,
    string RecurrenceType,
    DateTime CurrentRemindAt,
    DateTime? NextRemindAt,
    int UserId) : DomainEvent;

#endregion
